import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TemplatePreviewLoading() {
  return (
    <div className="container max-w-7xl py-6">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <div className="size-10 animate-pulse rounded-md bg-muted"></div>
          <div>
            <div className="mb-2 h-8 w-64 animate-pulse rounded-md bg-muted"></div>
            <div className="h-4 w-40 animate-pulse rounded-md bg-muted"></div>
            <div className="mt-2 h-4 w-80 animate-pulse rounded-md bg-muted"></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted"></div>
          <div className="h-10 w-40 animate-pulse rounded-md bg-muted"></div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - PDF Preview Skeleton */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>PDF Preview</CardTitle>
              <div className="h-9 w-32 animate-pulse rounded-md bg-muted"></div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t">
                <div className="h-[800px] w-full animate-pulse bg-muted"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - API Integration Skeleton */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i}>
                    <div className="mb-2 h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                    <div className="h-6 w-full animate-pulse rounded-md bg-muted"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 h-8 w-64 animate-pulse rounded-md bg-muted"></div>
              <div className="mb-4 h-64 w-full animate-pulse rounded-md bg-muted"></div>
              <div className="space-y-2">
                <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
                <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
