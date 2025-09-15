import { useState } from 'react';
import { Info, Github, MessageSquare, FileText } from 'lucide-react';
import { LandingPage } from '../../LandingPage';

export function AuditVerseLandingPage() {
  const [showDemo, setShowDemo] = useState(false);

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
    setShowDemo(true);
  };

  const handleExampleData = () => {
    console.log('Loading example data...');
    setShowDemo(true);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url(/assets/Auditverse.png)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"></div>

      <div className="relative z-10">
        <LandingPage
          icon="🛡️"
          title="AuditVerse"
          subtitle="Advanced Security Audit Visualization Platform"
          showInfoButton={true}
          infoPopup={{
            title: "Privacy & Security",
            icon: <Info className="w-6 h-6 text-blue-600" />,
            sections: [
              {
                icon: <span className="text-2xl">🔒</span>,
                title: "100% Browser-Based",
                content: "All processing happens locally in your browser. No data is ever uploaded to any server."
              },
              {
                icon: <span className="text-2xl">🛡️</span>,
                title: "Your Data Stays Private",
                bullets: [
                  "No cloud storage or external APIs",
                  "No tracking or analytics",
                  "Complete data sovereignty"
                ]
              },
              {
                icon: <span className="text-2xl">⚡</span>,
                title: "Instant Processing",
                content: "Real-time visualization without network latency. Your sensitive audit data never leaves your machine."
              }
            ]
          }}
          actions={[
            {
              label: 'Choose JSON File',
              variant: 'primary',
              tooltip: 'Select a JSON audit file to visualize'
            },
            {
              label: 'Use Example Data',
              onClick: handleExampleData,
              variant: 'secondary',
              tooltip: 'Load sample data to explore features'
            }
          ]}
          fileUpload={{
            accept: '.json',
            onFileSelect: handleFileSelect,
            dragDropEnabled: true
          }}
          footerLinks={[
            {
              icon: <Github className="w-6 h-6" />,
              href: 'https://github.com/yourusername/auditverse',
              title: 'View on GitHub'
            },
            {
              icon: <MessageSquare className="w-6 h-6" />,
              href: 'https://github.com/yourusername/auditverse/issues',
              title: 'Report an Issue'
            },
            {
              icon: <FileText className="w-6 h-6" />,
              href: 'https://github.com/yourusername/auditverse#readme',
              title: 'Documentation'
            }
          ]}
          className="pt-20"
          containerClassName="backdrop-blur-md bg-white/10"
        />
      </div>
    </div>
  );
}