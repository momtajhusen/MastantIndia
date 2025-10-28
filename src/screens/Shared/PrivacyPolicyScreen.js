import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyPolicyScreen = () => {
  const policyData = [
    {
      title: '1. Introduction',
      content: 'Mastant India ("we", "us", "our") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose and safeguard your information when you visit our website, use our mobile app, engage with our services (together, the "Services"). By accessing or using the Services, you acknowledge that you have read, understood and agree to the practices described in this Policy.'
    },
    {
      title: '2. Data We Collect',
      content: 'We may collect the following types of personal data:\n\n• Contact information: name, email address, phone number, postal address.\n• Account information: username, password, profile details.\n• Payment and transaction information: billing address, payment method, transaction history (where applicable).\n• Usage data: IP address, device information, browser type, access times, pages viewed.\n• Artisan / partner information: professional credentials, photographs of products, business addresses, tax/GST details (as applicable).\n• Communications: any messages you send us (feedback, support requests).'
    },
    {
      title: '3. How We Use Your Data',
      content: 'We use your personal data for purposes including:\n\n• To provide, operate and maintain our Services.\n• To register and manage your account.\n• To process payments and fulfil orders (if you buy or sell craft products via our platform).\n• To communicate with you: send service updates, support responses, marketing (with your consent).\n• To improve our Service: analytics, research, product development.\n• To ensure security and prevent fraud, unauthorised access or damage.\n• To comply with legal and regulatory obligations.'
    },
    {
      title: '4. Sharing and Disclosure',
      content: 'We will not sell your personal data. We may share your information with:\n\n• Service providers, contractors and vendors working on our behalf, who agree to handle your data in accordance with our instructions and applicable law.\n• Artisans / service-partners whom you engage through our platform (as necessary to deliver services or products).\n• Regulatory bodies, law enforcement or courts if required by law or in response to legal process.\n• In the event of a business transition (merger, acquisition, sale of assets), your personal data may be transferred as part of that transaction.'
    },
    {
      title: '5. Data Retention',
      content: 'We will retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, to meet legal obligations, resolve disputes, enforce our agreements, and maintain records. We may retain and use aggregated or anonymised data indefinitely for research and analytics.'
    },
    {
      title: '6. Security of Your Data',
      content: 'We implement appropriate technical and organisational security measures to protect your personal data from unauthorised access, disclosure, alteration or destruction. These measures include encryption, secure access controls, regular audits and staff training. However no system is completely secure, and while we strive to protect your data, we cannot guarantee absolute security.'
    },
    {
      title: '7. Your Rights',
      content: 'You have certain rights with respect to your personal data, subject to applicable law:\n\n• The right to access and obtain a copy of your personal data.\n• The right to correct or update your data.\n• The right to delete or request deletion of your personal data.\n• The right to opt-out of marketing communications.\n\nIf you wish to exercise any of these rights, please contact us at info@mastantindia.com and we will respond in accordance with applicable law.'
    },
    {
      title: '8. Cookies and Tracking Technologies',
      content: 'We use cookies, web beacons, pixel tags and similar technologies to collect information and enhance your experience. These help us remember your preferences, track usage, and improve our Services. You may disable or delete cookies via your browser settings, but doing so may affect your experience.'
    },
    {
      title: '9. International Transfers',
      content: 'Your personal data may be transferred to, stored and processed in countries other than your home country (for example, where our service providers or data-storage facilities are located). By using the Services and providing your data, you consent to such transfers as described herein.'
    },
    {
      title: '10. Changes to This Privacy Policy',
      content: 'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new Policy on our website and updating the "Last updated" date. Your continued use of the Services after such changes constitutes your acceptance of the revised Policy.'
    },
    {
      title: '11. Contact Us / Grievance Officer',
      content: 'If you have any questions, concerns or requests regarding this Privacy Policy or how we handle your data, please reach out to our Grievance Officer:\n\nGrievance Officer: Preeti\nEmail: info@mastantindia.com'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last updated: 22 Oct 2025</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {policyData.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}
          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 24,
    color: '#374151',
    textAlign: 'left',
    fontWeight: '400',
  },
  bottomPadding: {
    height: 20,
  },
});

export default PrivacyPolicyScreen;