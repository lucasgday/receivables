
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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
      const headers = rows[0].split(',').map(header => header.trim());
      
      // Check if required columns exist
      const requiredColumns = ['date', 'description', 'amount', 'reference'];
      const missingColumns = requiredColumns.filter(col => !headers.some(h => h.toLowerCase().includes(col)));
      
      if (missingColumns.length > 0) {
        throw new Error(`CSV is missing required columns: ${missingColumns.join(', ')}`);
      }

      setProgress(30);
      
      // Process data
      const movements = [];
      const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
      const descriptionIndex = headers.findIndex(h => h.toLowerCase().includes('description'));
      const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
      const referenceIndex = headers.findIndex(h => h.toLowerCase().includes('reference'));
      
      // Get existing references to avoid duplicates
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
        
        const reference = values[referenceIndex];
        
        // Skip if this reference already exists
        if (existingReferences.has(reference)) continue;
        
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
        
        // Parse amount - fix TypeScript error here
        let amountStr = values[amountIndex].replace(/[^\d.-]/g, '');
        let amount = parseFloat(amountStr);
        
        if (isNaN(amount)) continue;
        
        movements.push({
          user_id: user.id,
          company_id: companyId,
          date,
          description: values[descriptionIndex],
          amount,  // This is now a number
          currency,
          reference,
        });
      }
      
      setProgress(70);
      
      if (movements.length === 0) {
        toast.info("No new movements found to import");
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
        
        // Calculate progress percentage correctly as a number
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
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
          <UploadCloud className="h-12 w-12 text-gray-400 mb-4" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            CSV file only (make sure it has date, description, amount, and reference columns)
          </p>
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
