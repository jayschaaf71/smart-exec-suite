import React, { useState } from 'react';
import AssessmentTypeSelector from '@/components/assessment/AssessmentTypeSelector';
import PersonalProductivityAssessment from '@/components/assessment/PersonalProductivityAssessment';
import BusinessTransformationAssessment from '@/components/assessment/BusinessTransformationAssessment';
import ComprehensiveAutomationAssessment from '@/components/assessment/ComprehensiveAutomationAssessment';

export default function Assessment() {
  const [selectedType, setSelectedType] = useState<'personal' | 'business' | 'comprehensive' | null>(null);

  const handleSelectType = (type: 'personal' | 'business' | 'comprehensive') => {
    setSelectedType(type);
  };

  const handleBackToSelector = () => {
    setSelectedType(null);
  };

  if (selectedType === 'personal') {
    return <PersonalProductivityAssessment />;
  }

  if (selectedType === 'business') {
    return <BusinessTransformationAssessment />;
  }

  if (selectedType === 'comprehensive') {
    return <ComprehensiveAutomationAssessment />;
  }

  return <AssessmentTypeSelector onSelectType={handleSelectType} />;
}