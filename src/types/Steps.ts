export type StepPoint = {
  text: string;
  isStrong?: boolean;
};

export type StepSection = {
  title: string;
  points: StepPoint[];
};

export type StepContent = {
  id: string;
  title: string;
  intro: string;
  media: {
    alt: string;
    type: 'image' | 'video';
    src: string;
  };
  sections?: StepSection[];
  points?: StepPoint[];
  closing?: string;
  image: string;
  imageAlt: string;
};
