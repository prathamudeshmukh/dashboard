import { Check, Copy, File, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { fetchTemplatesFromGallery } from '@/libs/actions/templates';
import { useTemplateStore } from '@/libs/store/TemplateStore';
import type { TemplateGalleryProps } from '@/types/Template';

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
    setTemplateName,
    setTemplateDescription,
    setHtmlContent,
  } = useTemplateStore();

  useEffect(() => {
    fetchTemplatesFromGallery().then((data) => {
      setTemplates(data);
    });
  }, []);

  // Get unique categories
  const categories = ['All', ...new Set(templates.map(template => template.category))];

  // Filter templates based on search and category
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch
        = searchTerm === ''
        || template.title.toLowerCase().includes(searchTerm.toLowerCase())
        || template?.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  function handleTemplateSelect(template: TemplateGalleryProps) {
    if (!template) {
      return;
    }
    selectTemplate(template.id);
    setTemplateName(template.title);
    setTemplateDescription(template?.description as string);
    setHtmlContent(template.htmlContent);
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
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category as string)}
            >
              {selectedCategory === category && <Check className="mr-1 size-3" />}
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Templates grid */}
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
                <div className={`flex size-8 items-center justify-center rounded-full ${template.color}`}>
                  <File className="size-4" />
                </div>
                <CardTitle className="text-base">{template.title}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="py-2">
              <p className="mb-2 text-sm text-muted-foreground">{template.description}</p>
            </CardContent>

            <CardFooter className="pt-0">
              <Button variant={selectedTemplate === template.id ? 'default' : 'outline'} size="sm" className="w-full">
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

      {/* Empty state */}
      {(filteredTemplates.length === 0 && !searchTerm) && (
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
    </div>
  );
}
