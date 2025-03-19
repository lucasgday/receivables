import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface LogNote {
  id: string;
  customer_id?: string;
  invoice_id?: string;
  note: string;
  created_at: string;
}

interface LogNotesProps {
  customerId?: string;
  invoiceId?: string;
}

export const LogNotes = ({ customerId, invoiceId }: LogNotesProps) => {
  const [logs, setLogs] = useState<LogNote[]>([]);
  const [newNote, setNewNote] = useState("");

  const fetchLogs = async () => {
    try {
      let query = supabase
        .from("logs")
        .select("*");

      if (customerId && invoiceId) {
        query = query.in('customer_id', [customerId]).or(`invoice_id.eq.${invoiceId}`);
      } else if (customerId) {
        query = query.eq('customer_id', customerId);
      } else if (invoiceId) {
        query = query.eq('invoice_id', invoiceId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load logs");
    }
  };

  const addLog = async () => {
    if (!newNote) return;

    try {
      const { error } = await supabase
        .from("logs")
        .insert([{ note: newNote, customer_id: customerId, invoice_id: invoiceId }]);

      if (error) throw error;

      setNewNote("");
      fetchLogs(); // Refresh logs after adding a new one
      toast.success("Log added successfully");
    } catch (error) {
      console.error("Error adding log:", error);
      toast.error("Failed to add log");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [customerId, invoiceId]);

  return (
    <div>
      <h3 className="text-lg font-semibold">Log Notes</h3>
      <Textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a new note..."
      />
      <Button onClick={addLog}>Add Note</Button>
      <div className="mt-4">
        {logs.map((log) => (
          <div key={log.id} className="border-b py-2">
            <p>{log.note}</p>
            <p className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
