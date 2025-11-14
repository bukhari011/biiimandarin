import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface ImportPreviewData {
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk_level: number;
  category: string;
  isValid: boolean;
}

interface ImportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ImportPreviewData[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportPreviewDialog = ({
  open,
  onOpenChange,
  data,
  onConfirm,
  onCancel,
}: ImportPreviewDialogProps) => {
  const validCount = data.filter((d) => d.isValid).length;
  const invalidCount = data.length - validCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview Import Data</DialogTitle>
          <div className="flex gap-4 pt-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Valid: {validCount}
            </Badge>
            {invalidCount > 0 && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                <XCircle className="h-3 w-3 mr-1" />
                Invalid: {invalidCount}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Hanzi</TableHead>
                <TableHead>Pinyin</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead>HSK</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} className={!item.isValid ? "bg-destructive/5" : ""}>
                  <TableCell>
                    {item.isValid ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.hanzi}</TableCell>
                  <TableCell>{item.pinyin}</TableCell>
                  <TableCell>{item.meaning}</TableCell>
                  <TableCell>
                    <Badge variant="outline">HSK {item.hsk_level}</Badge>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={validCount === 0}>
            Import {validCount} Kata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
