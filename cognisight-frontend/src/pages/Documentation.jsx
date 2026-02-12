import React, { useState } from 'react';
// Adjust these import paths based on where you store these components.
// I recommend moving TemplateSelector and DocumentationGenerator to your 'components' folder.
import TemplateSelector from '../components/TemplateSelector'; 
import DocumentationGenerator from '../components/DocumentationGenerator'; 
//import '../styels/DocumentationGenerator.css'; // Assuming you have a styles folder, or keep it relative

export function Documentation() {
  const [templateConfig, setTemplateConfig] = useState({
    useStandard: false,
    templateFiles: [],
  });
  const [step, setStep] = useState('template'); // 'template' | 'generator'

  const handleTemplateConfig = (config) => {
    setTemplateConfig(config);
    setStep('generator');
  };

  const handleBackFromGenerator = () => {
    setStep('template');
  };

  return (
    <div className="documentation-page-container" style={{ padding: '20px' }}>
      <h1>Documentation Generator</h1>
      {step === 'template' ? (
        <TemplateSelector onConfigured={handleTemplateConfig} />
      ) : (
        <DocumentationGenerator
          templateConfig={templateConfig}
          onBack={handleBackFromGenerator}
        />
      )}
    </div>
  );
}