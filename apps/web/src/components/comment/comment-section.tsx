import { getComments, buildThread } from "@/lib/comments";
import { CommentList } from "./comment-list";
import { CommentBar } from "./comment-bar";

export async function CommentSection({
  uri,
  cid,
  songHandle,
  songRkey,
  songTitle,
  songCoverArt,
  songAuthor,
  songAuthorDisplayName,
  songAuthorAvatar,
  songDescription,
  isLoggedIn,
  userDid,
  userHandle,
  userAvatar,
}: {
  uri: string;
  cid: string | undefined;
  songHandle: string;
  songRkey: string;
  songTitle: string;
  songCoverArt: string;
  songAuthor: string;
  songAuthorDisplayName?: string;
  songAuthorAvatar?: string;
  songDescription?: string | null;
  isLoggedIn: boolean;
  userDid?: string;
  userHandle?: string;
  userAvatar?: string;
}) {
  const data = await getComments(uri, userDid);
  const threadRoots = buildThread(data.comments);

  return (
    <div id="comments" className="flex flex-col gap-4">
      {isLoggedIn && cid && (
        <CommentBar
          trackUri={uri}
          trackCid={cid}
          userAvatar={userAvatar}
          userHandle={userHandle}
          songTitle={songTitle}
          songCoverArt={songCoverArt}
          songAuthor={songAuthor}
          songAuthorDisplayName={songAuthorDisplayName}
          songAuthorAvatar={songAuthorAvatar}
          songDescription={songDescription}
        />
      )}

      <CommentList
        uri={uri}
        cid={cid}
        songHandle={songHandle}
        songRkey={songRkey}
        isLoggedIn={isLoggedIn}
        userDid={userDid}
        userAvatar={userAvatar}
        userHandle={userHandle}
        threadRoots={threadRoots}
      />
    </div>
  );
}
