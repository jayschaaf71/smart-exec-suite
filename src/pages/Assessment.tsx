import React, { useState } from 'react';
import AssessmentTypeSelector from '@/components/assessment/AssessmentTypeSelector';
import PersonalProductivityAssessment from '@/components/assessment/PersonalProductivityAssessment';
import BusinessTransformationAssessment from '@/components/assessment/BusinessTransformationAssessment';

export default function Assessment() {
  const [selectedType, setSelectedType] = useState<'personal' | 'business' | null>(null);

  const handleSelectType = (type: 'personal' | 'business') => {
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

  return <AssessmentTypeSelector onSelectType={handleSelectType} />;
}