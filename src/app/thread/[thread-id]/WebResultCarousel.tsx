import type { SearchWebItem, SearchWebResult } from "@/lib/zod/thread";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const WebResult = ({ result }: { result: SearchWebItem }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{result.title}</CardTitle>
        <CardDescription>{result.description}</CardDescription>
      </CardHeader>
      {result.screenshot && (
        <CardContent>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.screenshot} alt={result.title} />
        </CardContent>
      )}
      <CardFooter>
        <Button asChild>
          <Link target="_blank" href={result.url}>
            Go to website
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const WebResultCarousel = ({ results }: { results: SearchWebResult }) => {
  return (
    <div>
      <Carousel className="mx-12">
        <CarouselContent>
          {results.map((result) => (
            <CarouselItem key={result.url}>
              <WebResult result={result} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default WebResultCarousel;
