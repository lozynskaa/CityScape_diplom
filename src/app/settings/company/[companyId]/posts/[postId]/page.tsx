"use client";

import { useRef, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";
import Post from "~/app/_components/post-card";
import { Spinner } from "~/app/_components/ui/spinner";
import CreatePostForm, {
  type CreatePostDetails,
} from "~/app/_components/create-post-form";
const requiredFields = ["title", "content"] as const;

const disabledCallback = (state: CreatePostDetails) => {
  return !requiredFields.every((field) => state[field]);
};

export default function EditPostPage() {
  const { companyId, postId } = useParams<{
    companyId: string;
    postId: string;
  }>();
  const router = useRouter();
  const [disabled, setDisabled] = useState(true);
  const postDetailsRef = useRef<CreatePostDetails>({});

  const { data: post, isFetching } = api.post.getPrivatePost.useQuery({
    id: postId,
  });
  const { mutate: updatePost } = api.post.updatePost.useMutation();
  const { mutateAsync: deletePost } = api.post.deletePost.useMutation();

  const handleCreatePost = () => {
    if (!disabledCallback(postDetailsRef.current)) {
      const filledPostDetails =
        postDetailsRef.current as Required<CreatePostDetails>;
      updatePost({
        id: postId,
        title: filledPostDetails.title,
        content: filledPostDetails.content ?? "",
        images: filledPostDetails.imageFiles ?? [],
      });
    }
  };

  const handleDeletePost = async () => {
    await deletePost({
      id: postId,
    });
    router.replace(`/settings/company/${companyId}/posts`);
  };

  if (isFetching) {
    return <Spinner />;
  }

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <h1 className="text-2xl font-bold">Post Preview</h1>
      <Post
        title={post?.title}
        content={post?.content}
        images={post?.imageUrls}
      />
      <div className="flex w-full flex-row items-center justify-between gap-x-4">
        <h1 className="flex-1 text-2xl font-bold">Edit Post</h1>
        <Button
          className="w-24 rounded-full"
          variant="destructive"
          onClick={handleDeletePost}
        >
          Delete
        </Button>
        <Button
          className="w-24 rounded-full"
          onClick={handleCreatePost}
          disabled={disabled}
        >
          Save
        </Button>
      </div>
      <CreatePostForm
        disabledCallback={disabledCallback}
        predefinedPost={post}
        postDetailsRef={postDetailsRef}
        setDisabled={setDisabled}
      />
    </div>
  );
}
