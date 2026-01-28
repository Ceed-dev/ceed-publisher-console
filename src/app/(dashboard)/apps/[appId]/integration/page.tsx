'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { App } from '@/types/app';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Copy, Check } from 'lucide-react';

export default function IntegrationPage() {
  const params = useParams();
  const appId = params.appId as string;

  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await fetch(`/api/dashboard/apps/${appId}`);
        if (response.ok) {
          const data = await response.json();
          setApp(data.app);
        }
      } catch (error) {
        console.error('Failed to fetch app:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [appId]);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="App Not Found" />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">
            The app you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  const webCode = `// Initialize the Ceed Ads SDK
import { CeedAds } from '@ceed/ads-sdk';

const ceedAds = new CeedAds({
  appId: '${app.appId}',
});

// Request an ad
const ad = await ceedAds.requestAd({
  platform: 'web',
  language: 'eng',
  contextText: 'Optional context for ad targeting',
});

// Track impression
if (ad) {
  await ceedAds.trackImpression(ad.requestId, ad.adId);
}

// Track click (when user clicks the ad)
await ceedAds.trackClick(ad.requestId, ad.adId);`;

  const iosCode = `// Initialize the Ceed Ads SDK
import CeedAdsSDK

let ceedAds = CeedAds(appId: "${app.appId}")

// Request an ad
ceedAds.requestAd(
    platform: .ios,
    language: .eng,
    contextText: "Optional context for ad targeting"
) { result in
    switch result {
    case .success(let ad):
        // Track impression
        ceedAds.trackImpression(requestId: ad.requestId, adId: ad.adId)

        // Display the ad...

    case .failure(let error):
        print("Failed to load ad: \\(error)")
    }
}

// Track click (when user taps the ad)
ceedAds.trackClick(requestId: ad.requestId, adId: ad.adId)`;

  const apiRequestExample = `curl -X POST '${typeof window !== 'undefined' ? window.location.origin : ''}/api/requests' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "appId": "${app.appId}",
    "platform": "web",
    "language": "eng",
    "contextText": "Optional context"
  }'`;

  const apiEventExample = `curl -X POST '${typeof window !== 'undefined' ? window.location.origin : ''}/api/events' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "appId": "${app.appId}",
    "requestId": "<request_id_from_ad_response>",
    "eventType": "impression",
    "adId": "<ad_id_from_response>"
  }'`;

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Integration Guide" description={app.appName}>
        <Link href={`/apps/${appId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to App
          </Button>
        </Link>
      </Header>

      <div className="flex-1 space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>App ID</CardTitle>
            <CardDescription>
              Use this ID to initialize the SDK in your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted px-4 py-2 font-mono text-sm">
                {app.appId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(app.appId, 'appId')}
              >
                {copied === 'appId' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SDK Integration</CardTitle>
            <CardDescription>
              Choose your platform and follow the integration guide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="web">
              <TabsList>
                <TabsTrigger value="web" disabled={!app.platforms.includes('web')}>
                  Web
                </TabsTrigger>
                <TabsTrigger value="ios" disabled={!app.platforms.includes('ios')}>
                  iOS
                </TabsTrigger>
                <TabsTrigger value="api">REST API</TabsTrigger>
              </TabsList>

              <TabsContent value="web" className="space-y-4">
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">1. Install the SDK</h4>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded bg-muted p-4 font-mono text-sm">
                      npm install @ceed/ads-sdk
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard('npm install @ceed/ads-sdk', 'npm')}
                    >
                      {copied === 'npm' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">2. Initialize and Use</h4>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded bg-muted p-4 font-mono text-sm">
                      {webCode}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(webCode, 'webCode')}
                    >
                      {copied === 'webCode' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ios" className="space-y-4">
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">1. Add the SDK via Swift Package Manager</h4>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded bg-muted p-4 font-mono text-sm">
                      https://github.com/ceed-ads/ios-sdk
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">2. Initialize and Use</h4>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded bg-muted p-4 font-mono text-sm">
                      {iosCode}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(iosCode, 'iosCode')}
                    >
                      {copied === 'iosCode' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="api" className="space-y-4">
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">Request an Ad</h4>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
                      {apiRequestExample}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(apiRequestExample, 'apiRequest')}
                    >
                      {copied === 'apiRequest' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Track Events</h4>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded bg-muted p-4 font-mono text-sm whitespace-pre-wrap">
                      {apiEventExample}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => copyToClipboard(apiEventExample, 'apiEvent')}
                    >
                      {copied === 'apiEvent' ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
