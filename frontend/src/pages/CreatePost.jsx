import React from "react";
import CreatePostCard from "../components/CreatePostCard.jsx";

export default function CreatePostPage() {
  return (
    <div className="lf-wrap">
      <CreatePostCard
        onCreated={() => {
          // you can navigate to /lost or show a toast here if you like
        }}
      />
    </div>
  );
}

