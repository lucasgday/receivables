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
      
      const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
      
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
      
      // Get existing references to avoid duplicates (not needed anymore but keep as reference)
      const { data: existingMovements } = await supabase
        .from('bank_movements')
        .select('reference')
        .eq('company_id', companyId);
      
      const existingReferences = new Set((existingMovements || []).map(m => m.reference));
      
      setProgress(50);
      
      // Process each row (skip header)
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(val => val.trim());
        if (values.length !== headers.length) continue;
        
        // Generate a unique reference ID instead of requiring it from the user
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const reference = `TRANS-${timestamp}-${randomStr}`;
        
        // Parse date
        let date = values[dateIndex];
        try {
          // Try to standardize date format
          const parsedDate = new Date(date);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
          }
        } catch (e) {
          console.warn("Could not parse date:", date);
        }
        
        // Parse amount
        let amountStr = values[amountIndex].replace(/[^\d.-]/g, '');
        let amount = parseFloat(amountStr);
        
        if (isNaN(amount)) continue;
        
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
