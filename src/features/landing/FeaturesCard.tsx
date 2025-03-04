import { Card, CardContent } from '@/components/ui/card';

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

export const FeaturesCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center space-y-4 p-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          {icon}
        </div>

        <h3 className="text-xl font-bold">{title}</h3>

        <p className="text-md text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};
