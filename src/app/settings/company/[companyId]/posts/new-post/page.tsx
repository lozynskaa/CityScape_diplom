"use client";

import { useRef, useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";
import CreatePostForm, {
  type CreatePostDetails,
} from "~/app/_components/create-post-form";

const requiredFields = ["title", "content"] as const;

const disabledCallback = (state: CreatePostDetails) => {
  return !requiredFields.every((field) => state[field]);
};

export default function NewPostPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [disabled, setDisabled] = useState(true);
  const router = useRouter();
  const postDetailsRef = useRef<CreatePostDetails>({});

  const { mutateAsync: createPost } = api.post.createPost.useMutation();

  const handleCreatePost = async () => {
    if (!disabledCallback(postDetailsRef.current)) {
      const filledPostDetails =
        postDetailsRef.current as Required<CreatePostDetails>;
      const newPost = await createPost({
        title: filledPostDetails.title,
        content: filledPostDetails.content ?? "",
        images: filledPostDetails.imageFiles ?? [],
        companyId,
      });

      if (newPost) {
        router.push(`/settings/company/${companyId}/posts/${newPost.id}`);
      }
    }
  };

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <div className="flex w-full flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">New Post</h1>
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
        postDetailsRef={postDetailsRef}
        setDisabled={setDisabled}
        previewPost
      />
    </div>
  );
}
