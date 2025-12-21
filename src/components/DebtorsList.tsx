import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Table, TableCell, TableRow } from "./ui/Table";
import { Button } from "./ui/Button";
import { useState } from "react";
import { MarkAsPaidDialog } from "./MarkAsPaidDialog";
import { Loader2 } from "lucide-react";

export function DebtorsList() {
    const debtors = useQuery(api.sales.getDebtors);
    const [selectedDebtor, setSelectedDebtor] = useState<{
        clientName: string;
        totalOwed: number;
    } | null>(null);

    if (!debtors) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
        );
    }

    const handlePayClick = (clientName: string, totalOwed: number) => {
        setSelectedDebtor({ clientName, totalOwed });
    };

    return (
        <div className="space-y-6">
            <Table
                title="Outstanding Debts"
                count={debtors.length}
                headers={["Client Name", "Total Owed", "Unpaid Sales", "Last Sale Date", "Action"]}
            >
                {debtors.length === 0 ? (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">
                            No outstanding debts found.
                        </td>
                    </tr>
                ) : (
                    debtors.map((debtor) => (
                        <TableRow key={debtor.clientName}>
                            <TableCell primary>{debtor.clientName}</TableCell>
                            <TableCell className="text-red-500 font-bold">
                                ${debtor.totalOwed.toFixed(2)}
                            </TableCell>
                            <TableCell>{debtor.salesCount}</TableCell>
                            <TableCell>
                                {new Date(debtor.lastSaleDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <Button
                                    size="sm"
                                    onClick={() => handlePayClick(debtor.clientName, debtor.totalOwed)}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    Pay Now
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </Table>

            {selectedDebtor && (
                <MarkAsPaidDialog
                    isOpen={!!selectedDebtor}
                    onClose={() => setSelectedDebtor(null)}
                    clientName={selectedDebtor.clientName}
                    totalOwed={selectedDebtor.totalOwed}
                />
            )}
        </div>
    );
}
