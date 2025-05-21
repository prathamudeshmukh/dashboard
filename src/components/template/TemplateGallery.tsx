import type * as Icons from 'lucide-react';
import { Check, Copy, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { fetchTemplatesFromGallery } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import type { TemplateGalleryProps } from '@/types/Template';

import { DynamicLucideIcon } from '../DynamicIcon';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export default function TemplateGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [templates, setTemplates] = useState<TemplateGalleryProps[]>([]);
  const {
    selectTemplate,
    selectedTemplate,
    templateGallery,
    setTemplateName,
    setTemplateDescription,
    setHtmlContent,
    setHandlebarsCode,
    setHandlebarsJson,
    setTemplateGallery,
  } = useTemplateStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTemplates = async () => {
      setIsLoading(true);
      try {
        // If gallery already exists in store, use it
        if (templateGallery) {
          setTemplates(templateGallery);
        } else {
          // Otherwise fetch and update both local + store
          const data = await fetchTemplatesFromGallery();
          setTemplates(data);
          setTemplateGallery(data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [templateGallery, setTemplateGallery]);

  // Get unique categories
  const categories = ['All', ...new Set(templates.map(template => template.category))];

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch
        = searchTerm === ''
        || template.title.toLowerCase().includes(searchTerm.toLowerCase())
        || template?.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, selectedCategory]);

  function handleTemplateSelect(template: TemplateGalleryProps) {
    if (!template) {
      return;
    }
    selectTemplate(template.id);
    setTemplateName(template.title);
    setTemplateDescription(template?.description as string);
    setHtmlContent(template.htmlContent);
    setHandlebarsCode(template.handlebarContent as string);
    setHandlebarsJson(JSON.stringify(template.sampleData as string, null, 2));
  }

  return (
    <div className="space-y-4">
      {/* Search and filter controls */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer text-base font-normal"
              onClick={() => setSelectedCategory(category as string)}
            >
              {selectedCategory === category && <Check className="mr-1 size-3" />}
              {category}
            </Badge>
          ))}
        </div>
      </div>
      {/** Loading Skeleton */}
      {isLoading
        ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[180px] animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          )
        : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-full">
                          <DynamicLucideIcon name={template.icon as keyof typeof Icons} color={`${template.color}`} />
                        </div>
                        <CardTitle className="text-xl font-medium">{template.title}</CardTitle>
                      </div>
                    </CardHeader>

                    <CardContent className="py-2">
                      <p className="mb-2 text-base font-normal text-muted-foreground">{template.description}</p>
                    </CardContent>

                    <CardFooter className="pt-0">
                      <Button variant={selectedTemplate === template.id ? 'default' : 'outline'} size="sm" className="w-full rounded-full text-base font-normal">
                        {selectedTemplate === template.id
                          ? (
                              <>
                                <Check className="mr-2 size-4" />
                                Selected
                              </>
                            )
                          : (
                              <>
                                <Copy className="mr-2 size-4" />
                                Use Template
                              </>
                            )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Empty state (only when search or filter applied) */}
              {filteredTemplates.length === 0 && (searchTerm || selectedCategory !== 'All') && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">No templates found matching your criteria.</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </>
          )}
    </div>
  );
}
