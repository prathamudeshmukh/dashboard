import { FileText } from 'lucide-react';

type HeroSectionProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description: React.ReactNode;
  button: React.ReactNode;
};

export const HeroSection = ({ title, subtitle, description, button }: HeroSectionProps) => {
  return (
    <section className="w-full bg-gradient-to-b from-background to-muted p-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">

          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                {title}
              </h1>
              {subtitle && <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl">{subtitle}</p>}
            </div>

            <div className="space-y-4">{description}</div>

            <p className="text-lg font-medium">
              Start generating PDFs in
              <strong>minutes</strong>
              , not weeks.
            </p>

            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {button}

            </div>
          </div>

          {/* Right Section - UI Mockup */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary to-primary/50 opacity-75 blur-xl"></div>
              <div className="relative overflow-hidden rounded-xl border bg-background p-8 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-primary" />
                      <span className="font-medium">Invoice_Template.pdf</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Generated</div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-muted"></div>
                    <div className="h-2 w-3/4 rounded-full bg-muted"></div>
                    <div className="h-2 w-1/2 rounded-full bg-muted"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-muted p-2">
                      <div className="h-12 rounded-md bg-muted-foreground/20"></div>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <div className="h-12 rounded-md bg-muted-foreground/20"></div>
                    </div>
                  </div>
                  <div className="rounded-md bg-muted p-2">
                    <div className="h-24 rounded-md bg-muted-foreground/20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
