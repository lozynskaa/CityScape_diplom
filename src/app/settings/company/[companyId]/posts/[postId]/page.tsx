"use client";

import { useEffect, useState } from "react";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import { Button } from "~/app/_components/ui/button";
import { api } from "~/trpc/react";
import { useParams, useRouter } from "next/navigation";
import Post from "~/app/_components/post-card";
import { Spinner } from "~/app/_components/ui/spinner";

const requiredFields = ["title", "content"];

export default function EditPostPage() {
  const { companyId, postId } = useParams<{
    companyId: string;
    postId: string;
  }>();
  const router = useRouter();

  const [postDetails, setPostDetails] = useState({
    title: "",
    content: "",
    images: [] as string[],
    imageFiles: [] as { fileName: string; file: string }[],
  });

  const { data: post, isFetching } = api.post.getPrivatePost.useQuery({
    id: postId,
  });
  const { mutate: updatePost } = api.post.updatePost.useMutation();
  const { mutateAsync: deletePost } = api.post.deletePost.useMutation();

  useEffect(() => {
    if (post) {
      setPostDetails({
        title: post.title,
        content: post.content ?? "",
        images: post.imageUrls,
        imageFiles: [],
      });
    }
  }, [post]);

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
            imageFiles: [...prev.imageFiles, parsedFile],
          }));
        };
      });
    }
  };

  const handleCreatePost = () => {
    updatePost({
      title: postDetails.title,
      content: postDetails.content,
      images: postDetails.imageFiles,
      id: postId,
    });
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
      <Post {...postDetails} images={postDetails.imageFiles} />
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
    </div>
  );
}
