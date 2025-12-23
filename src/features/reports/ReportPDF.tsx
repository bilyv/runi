import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2563EB',
    },
    businessInfo: {
        textAlign: 'right',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1E40AF',
        backgroundColor: '#EFF6FF',
        padding: 4,
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        minHeight: 20,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#F9FAFB',
        fontWeight: 'bold',
    },
    tableCol: {
        flex: 1,
        borderRightWidth: 1,
        borderRightColor: '#E5E7EB',
        padding: 4,
    },
    tableCell: {
        fontSize: 7,
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    summaryCard: {
        width: '23%',
        padding: 10,
        backgroundColor: '#F9FAFB',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    summaryLabel: {
        fontSize: 7,
        color: '#6B7280',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    summaryValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#9CA3AF',
        fontSize: 7,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 10,
    },
    bold: {
        fontWeight: 'bold',
    },
    profit: {
        color: '#059669',
    },
    loss: {
        color: '#DC2626',
    }
});

interface ReportPDFProps {
    title: string;
    businessName: string;
    dateRange: string;
    layout?: 'portrait' | 'landscape';
    sections: {
        type: 'table' | 'summary' | 'list';
        title?: string;
        data: any;
        columns?: { label: string; key: string; format?: (val: any) => string; width?: string | number }[];
    }[];
}

export const ReportPDF = ({ title, businessName, dateRange, layout = 'portrait', sections }: ReportPDFProps) => (
    <Document>
        <Page size="A4" orientation={layout} style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                    <Text>{dateRange}</Text>
                </View>
                <View style={styles.businessInfo}>
                    <Text style={{ fontWeight: 'bold' }}>{businessName}</Text>
                    <Text>Generated on {format(new Date(), 'PPP p')}</Text>
                </View>
            </View>

            {sections.map((section, sIdx) => (
                <View key={sIdx} style={styles.section}>
                    {section.title && <Text style={styles.sectionTitle}>{section.title}</Text>}

                    {section.type === 'summary' && (
                        <View style={styles.summaryGrid}>
                            {section.data.map((item: any, iIdx: number) => (
                                <View key={iIdx} style={styles.summaryCard}>
                                    <Text style={styles.summaryLabel}>{item.label}</Text>
                                    <Text style={[styles.summaryValue, item.isProfit ? styles.profit : item.isLoss ? styles.loss : {}]}>
                                        {item.value}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {section.type === 'table' && section.columns && (
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                {section.columns.map((col, cIdx) => (
                                    <View key={cIdx} style={[styles.tableCol, col.width ? { flex: 0, width: col.width } : {}]}>
                                        <Text style={[styles.tableCell, styles.bold]}>{col.label}</Text>
                                    </View>
                                ))}
                            </View>
                            {section.data.map((row: any, rIdx: number) => (
                                <View key={rIdx} style={styles.tableRow}>
                                    {section.columns!.map((col, cIdx) => (
                                        <View key={cIdx} style={[styles.tableCol, col.width ? { flex: 0, width: col.width } : {}]}>
                                            <Text style={styles.tableCell}>
                                                {col.format ? col.format(row[col.key]) : row[col.key]}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}

                    {section.type === 'list' && (
                        <View style={{ gap: 4 }}>
                            {section.data.map((item: any, iIdx: number) => (
                                <View key={iIdx} style={{ flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 4 }}>
                                    <Text style={{ fontSize: 8 }}>{item.label}</Text>
                                    <Text style={{ fontSize: 8, fontWeight: 'bold' }}>{item.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            ))}

            {/* Footer */}
            <Text
                style={styles.footer}
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} - ${businessName} Business Report`}
            />
        </Page>
    </Document>
);
