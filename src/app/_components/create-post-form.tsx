"use client";
import { type MutableRefObject, useEffect, useState } from "react";
import { type Post } from "~/server/db/post.schema";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import If from "./ui/if";
import PostCard from "./post-card";

export type CreatePostDetails = Omit<Partial<Post>, "imageUrls"> & {
  imageFiles?: { file: string; fileName: string }[];
};

type Props = {
  predefinedPost?: Post;
  postDetailsRef: MutableRefObject<CreatePostDetails>;
  disabledCallback: (state: CreatePostDetails) => boolean;
  setDisabled: (state: boolean) => void;
  previewPost?: boolean;
};

export default function CreatePostForm({
  predefinedPost,
  postDetailsRef,
  disabledCallback,
  setDisabled,
  previewPost,
}: Props) {
  const [postDetails, setPostDetails] = useState<CreatePostDetails>({});

  useEffect(() => {
    postDetailsRef.current = postDetails;
    if (disabledCallback) {
      const isDisabled = disabledCallback(postDetails);
      setDisabled(isDisabled);
    }
  }, [postDetails]);

  useEffect(() => {
    if (predefinedPost) {
      setPostDetails(predefinedPost);
    }
  }, [predefinedPost]);

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
            imageFiles: [...(prev.imageFiles ?? []), parsedFile],
          }));
        };
      });
    }
  };

  return (
    <>
      <form className="grid w-full grid-cols-2 gap-5">
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
          value={postDetails.content ?? ""}
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
      <If condition={previewPost}>
        <h1 className="text-2xl font-bold">Post Preview</h1>
        <PostCard
          title={postDetails.title}
          content={postDetails.content}
          images={postDetails.imageFiles}
        />
      </If>
    </>
  );
}
