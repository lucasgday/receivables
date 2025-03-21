import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloud, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BankMovement {
  id: string;
  company_id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  reference: string;
  invoice_id: string | null;
  user_id: string;
  created_at: string;
}

interface UploadCsvProps {
  companyId: string | null;
  currency: string;
  onImportStart: () => void;
  onImportComplete: () => void;
}

export function UploadCsv({ companyId, currency, onImportStart, onImportComplete }: UploadCsvProps) {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const parseDate = (dateStr: string): string | null => {
    try {
      // Remove any extra whitespace
      dateStr = dateStr.trim();

      // Handle DD/MM/YYYY format
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          // Handle 2-digit years
          const fullYear = year.length === 2 ? (parseInt(year) > 50 ? '19' + year : '20' + year) : year;
          return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Handle DD-MM-YYYY format
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Handle DD.MM.YYYY format
      if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Try parsing as ISO date
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }

      return null;
    } catch (e) {
      console.warn("Could not parse date:", dateStr);
      return null;
    }
  };

  const parseAmount = (amountStr: string): number | null => {
    try {
      // Remove any extra whitespace
      amountStr = amountStr.trim();

      // Handle different thousand separators and decimal points
      let normalizedAmount = amountStr
        // Remove currency symbols and other non-numeric characters
        .replace(/[^\d.,\s]/g, '')
        // Remove spaces
        .replace(/\s/g, '')
        // Handle different thousand separators
        .replace(/(\d)\.(\d{3})/g, '$1$2')
        // Replace comma with dot for decimal point
        .replace(',', '.');

      const amount = parseFloat(normalizedAmount);
      return isNaN(amount) ? null : amount;
    } catch (e) {
      console.warn("Could not parse amount:", amountStr);
      return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!companyId) {
      toast.error("Please select a company first");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      toast.error("Only CSV files are allowed");
      return;
    }

    setIsUploading(true);
    onImportStart();
    setProgress(10);

    try {
      // Parse CSV file
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());

      if (rows.length <= 1) {
        throw new Error("CSV file is empty or contains only headers");
      }

      // Try to detect the separator (comma or semicolon)
      const firstRow = rows[0];
      const separator = firstRow.includes(';') ? ';' : ',';
      const headers = firstRow.split(separator).map(header => header.trim().toLowerCase());

      // Check if required columns exist
      const requiredColumns = ['date', 'description', 'amount'];
      const missingColumns = requiredColumns.filter(col => !headers.some(h => h.includes(col)));

      if (missingColumns.length > 0) {
        throw new Error(`CSV is missing required columns: ${missingColumns.join(', ')}`);
      }

      setProgress(30);

      // Process data
      const movements = [];
      const dateIndex = headers.findIndex(h => h.includes('date'));
      const descriptionIndex = headers.findIndex(h => h.includes('description'));
      const amountIndex = headers.findIndex(h => h.includes('amount'));

      setProgress(50);

      // Process each row (skip header)
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(separator).map(val => val.trim());
        if (values.length !== headers.length) continue;

        // Generate a unique reference ID
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const reference = `TRANS-${timestamp}-${randomStr}`;

        // Parse date
        const date = parseDate(values[dateIndex]);
        if (!date) {
          console.warn(`Skipping row ${i + 1}: Invalid date format`);
          continue;
        }

        // Parse amount
        const amount = parseAmount(values[amountIndex]);
        if (amount === null) {
          console.warn(`Skipping row ${i + 1}: Invalid amount format`);
          continue;
        }

        movements.push({
          user_id: user.id,
          company_id: companyId,
          date,
          description: values[descriptionIndex],
          amount,
          currency,
          reference,
        });
      }

      setProgress(70);

      if (movements.length === 0) {
        toast.error("No valid movements found to import. Please check your CSV format.");
        setIsUploading(false);
        onImportComplete();
        // Reset the file input
        event.target.value = '';
        return;
      }

      // Insert data in batches to avoid hitting limits
      const batchSize = 100;
      for (let i = 0; i < movements.length; i += batchSize) {
        const batch = movements.slice(i, i + batchSize);
        const { error } = await supabase
          .from('bank_movements')
          .insert(batch);

        if (error) throw error;

        // Calculate progress percentage correctly
        setProgress(70 + Math.floor((i / movements.length) * 30));
      }

      setProgress(100);
      toast.success(`Successfully imported ${movements.length} bank movements`);
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Failed to process CSV file: " + (error as Error).message);
    } finally {
      setIsUploading(false);
      onImportComplete();
      // Reset the file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {isUploading ? (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-center">Processing CSV file: {progress}%</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>CSV file with date, description, and amount columns</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  <Info className="h-3 w-3 ml-1" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Your CSV should have at least these columns: date, description, and amount.
                    The system will automatically generate a unique reference ID for each transaction.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            className="absolute w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileUpload}
            disabled={!companyId || isUploading}
            style={{ top: 0, left: 0 }}
          />
          <Button
            variant="outline"
            className="mt-4 pointer-events-none"
            disabled={!companyId || isUploading}
          >
            Select CSV File
          </Button>
        </div>
      )}
    </div>
  );
}
