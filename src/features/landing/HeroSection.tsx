import { Columns, Image, List, Type } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
              <strong> minutes</strong>
            </p>

            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              {button}

            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary to-primary/50 opacity-75 blur-xl"></div>
              <div className="relative overflow-hidden rounded-xl border bg-background p-6 shadow-lg">
                <Tabs defaultValue="html-builder" className="w-full">
                  <TabsList className="mb-4 grid w-full grid-cols-2">
                    <TabsTrigger value="html-builder">HTML Builder</TabsTrigger>
                    <TabsTrigger value="handlebars">Handlebars</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html-builder">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-lg font-semibold">HTML Builder</div>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-1 space-y-2">
                        <div className="flex flex-col items-center justify-center rounded-md bg-muted p-2">
                          <Columns className="size-6 text-muted-foreground" />
                          <span className="mt-1 text-xs">Layout</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-md bg-muted p-2">
                          <Type className="size-6 text-muted-foreground" />
                          <span className="mt-1 text-xs">Text</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-md bg-muted p-2">
                          <Image className="size-6 text-muted-foreground" />
                          <span className="mt-1 text-xs">Image</span>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-md bg-muted p-2">
                          <List className="size-6 text-muted-foreground" />
                          <span className="mt-1 text-xs">List</span>
                        </div>
                      </div>
                      <div className="col-span-3 rounded-md bg-muted p-4">
                        <div className="mb-2 rounded-md bg-background p-2"></div>
                        <div className="mb-2 w-3/4 rounded-md bg-background p-2"></div>
                        <div className="mb-2 w-1/2 rounded-md bg-background p-2"></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-md bg-background p-2"></div>
                          <div className="rounded-md bg-background p-2"></div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="handlebars">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-lg font-semibold">Handlebars Template</div>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div className="rounded-md bg-muted p-4">
                        <pre className="text-sm">
                          <code>
                            {
                              '<h1>{{title}}</h1>\n<p>{{content}}</p>\n<ul>\n  {{#each items}}\n    <li>{{this}}</li>\n  {{/each}}\n</ul>'
                            }
                          </code>
                        </pre>
                      </div>
                      <div className="rounded-md bg-muted p-4">
                        <pre className="text-sm">
                          <code>
                            {
                              '{\n  "title": "Welcome",\n  "content": "This is a sample template.",\n  "items": ["Item 1", "Item 2", "Item 3"]\n}'
                            }
                          </code>
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
