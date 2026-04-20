import React from "react";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import type { AnalysisReport } from "@/lib/analysis";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 11, color: "#1A1A2E" },
  title: { fontSize: 24, marginBottom: 8 },
  section: { marginTop: 10, padding: 10, border: "1 solid #d7e3f5", borderRadius: 6 },
});

function Doc({ report, url, agency }: { report: AnalysisReport; url: string; agency: string }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{agency}</Text>
        <Text>SEO & GEO Performance Report</Text>
        <Text>Website: {url}</Text>
      </Page>
      <Page size="A4" style={styles.page}>
        <Text>SEO: {report.scores.seoTotal}</Text>
        <Text>GEO: {report.scores.geoTotal * 5}</Text>
        <Text>Overall: {report.scores.total}</Text>
        <View style={styles.section}>
          <Text>{report.executiveSummary}</Text>
        </View>
        <View style={styles.section}>
          <Text>{report.aiVisibilityAssessment}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateAnalysisPdf(report: AnalysisReport, url: string, agency: string) {
  const blob = await pdf(<Doc report={report} url={url} agency={agency} />).toBlob();
  return Buffer.from(await blob.arrayBuffer());
}
