"use client";

import { useState } from "react";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";
import Post from "~/app/_components/post-card";

const requiredFields = ["title", "content"];

export default function NewPostPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const router = useRouter();
  const [postDetails, setPostDetails] = useState({
    title: "",
    content: "",
    images: [] as { fileName: string; file: string }[],
  });

  const { mutateAsync: createPost } = api.post.createPost.useMutation();

  const handleLoadFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files);

      fileList.forEach((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = () => {
          const base64Data = reader.result as string; // e.g., "data:image/png;base64,..."

          const parsedFile = {
            file: base64Data,
            fileName: file.name,
          };
          setPostDetails((prev) => ({
            ...prev,
            imageFiles: [...prev.images, parsedFile],
          }));
        };
      });
    }
  };

  const handleCreatePost = async () => {
    const newPost = await createPost({
      title: postDetails.title,
      content: postDetails.content,
      images: postDetails.images,
      companyId,
    });

    if (newPost) {
      router.push(`/settings/company/${companyId}/posts/${newPost.id}`);
    }
  };

  return (
    <div className="h-full space-y-8 px-12 py-8">
      <div className="flex w-full flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">New Post</h1>
        <Button
          className="w-24 rounded-full"
          onClick={handleCreatePost}
          disabled={requiredFields.some(
            (field) => !postDetails[field as keyof typeof postDetails],
          )}
        >
          Save
        </Button>
      </div>
      <form className="grid w-full grid-cols-2 gap-4">
        <Input
          placeholder="Enter title"
          label="Post Title"
          value={postDetails.title}
          onChange={(e) =>
            setPostDetails((prev) => ({ ...prev, title: e.target.value }))
          }
        />

        <Input
          type="file"
          label="Post Images"
          accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff|image/*"
          onChange={handleLoadFiles}
          multiple
        />
        <Textarea
          placeholder="Enter content"
          label="Post Content"
          value={postDetails.content}
          onChange={(e) =>
            setPostDetails((prev) => ({
              ...prev,
              content: e.target.value,
            }))
          }
          className="h-40"
          wrapperClassName="col-span-2"
        />
      </form>

      <h1 className="text-2xl font-bold">Post Preview</h1>
      <Post {...postDetails} />
    </div>
  );
}
