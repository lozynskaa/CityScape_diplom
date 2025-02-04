import Link from "next/link";
import CompanyBlock from "~/app/_components/company-block";
import Post from "~/app/_components/post-card";
import EventCard from "~/app/_components/quick-event-card";
import { Button } from "~/app/_components/ui/button";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

type Props = {
  params: Promise<{
    companyId: string;
  }>;
};

export const revalidate = 60;

export default async function CompanyPage({ params }: Props) {
  const session = await auth();
  const { companyId } = await params;
  const companyData = await api.company.getCompany({ id: companyId });
  const companyEvents = await api.event.getEventsByCompany({ id: companyId });
  const companyPosts = await api.post.getCompanyPosts({ id: companyId });

  const firstThreeEvents = companyEvents.slice(0, 3);
  const firstThreePosts = companyPosts.slice(0, 3);

  // void api.company.getCompany.prefetch({ id: companyId });

  return (
    <div className="w-full space-y-8 px-12 py-8">
      {companyData && <CompanyBlock company={companyData} />}
      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-2xl font-bold">Active Events</h3>
          <Link
            href={
              firstThreeEvents.length
                ? `/event?companyId=${companyId}&page=1`
                : ""
            }
          >
            <Button
              className="w-22 rounded-full font-bold"
              disabled={!firstThreeEvents.length}
            >
              See All
            </Button>
          </Link>
        </div>
        {firstThreeEvents.length ? (
          firstThreeEvents.map((event) => (
            <div key={event.id}>
              <EventCard event={event} userId={session?.user?.id} />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No events yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between">
          <h3 className="text-2xl font-bold">Posts</h3>
          <Link
            href={firstThreePosts.length ? `/post?companyId=${companyId}/` : ""}
          >
            <Button
              className="w-22 rounded-full font-bold"
              disabled={!firstThreePosts.length}
            >
              See All
            </Button>
          </Link>
        </div>
        {firstThreePosts.length ? (
          firstThreePosts.map((post) => (
            <div key={post.id}>
              <Post
                title={post.title}
                content={post.content}
                images={post.imageUrls}
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
