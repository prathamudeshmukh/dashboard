import type React from 'react';

import type { StepContent } from '@/types/Steps';

type StepDescriptionProps = {
  content: StepContent;
};

const StepDescription: React.FC<StepDescriptionProps> = ({ content }) => {
  const renderPoints = (points: StepContent['points']) => {
    if (!points) {
      return null;
    }

    return (
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {points.map((point, index) => (
          <li key={index} className={point.isStrong ? 'font-semibold' : ''}>
            {point.text}
          </li>
        ))}
      </ul>
    );
  };

  const renderSections = (sections: StepContent['sections']) => {
    if (!sections) {
      return null;
    }

    return (
      <div className="mt-2 space-y-4">
        {sections.map((section, index) => (
          <div key={index}>
            <strong className="mb-1 block">{section.title}</strong>
            <ul className="list-disc space-y-1 pl-5">
              {section.points.map((point, pointIndex) => (
                <li key={pointIndex} className={point.isStrong ? 'font-semibold' : ''}>
                  {point.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="prose prose-invert max-w-none">
      <p>{content.intro}</p>
      {renderPoints(content.points)}
      {renderSections(content.sections)}
      {content.closing && <p className="mt-4">{content.closing}</p>}
    </div>
  );
};

export default StepDescription;
