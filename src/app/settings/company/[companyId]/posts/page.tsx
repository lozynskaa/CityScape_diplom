"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import Post from "~/app/_components/post-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/app/_components/ui/carousel";
import { Spinner } from "~/app/_components/ui/spinner";
import { api } from "~/trpc/react";

export default function PostSelect() {
  const { companyId } = useParams<{ companyId: string }>();
  const { data: posts = [], isFetching } = api.company.getCompanyPosts.useQuery(
    {
      id: companyId,
    },
  );

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-y-4 px-12 py-8">
      <Carousel
        opts={{
          align: "start",
          axis: "x",
        }}
        orientation="vertical"
        className="h-full w-full py-4"
      >
        <CarouselContent>
          {posts.map((post, index) => (
            <CarouselItem key={index} className="basis-1/5">
              <Link href={`/settings/company/${companyId}/posts/${post.id}`}>
                <Post
                  title={post.title}
                  content={post.content ?? ""}
                  images={JSON.parse(post.images ?? "[]")}
                />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
