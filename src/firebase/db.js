//this is going to store Firebase realtime database API code
import { db } from "./firebase";
import { ref, update, push, set, remove, onValue } from "firebase/database";
import date from 'date-and-time';

//create an user and store it at users/id path (it's an asynchronous func)

export const doCreateUser = (id, email, userName, avatar) =>{
  update(ref(db, `users/${id}`), { email, userName, avatar });
}

export const doAddSubscriber = (userId, subscriberId) =>{
  const usersRef = ref(db, `users/${userId}/subscribers`);
  const newUserstRef = push(usersRef);
  set(newUserstRef, { subscriberId });
}

export const doAddSubscription = (userId, channelId) =>{
  const usersRef = ref(db, `users/${userId}/subscriptions`);
  const newUserstRef = push(usersRef);
  set(newUserstRef, { channelId });
}

export const doRemoveSubscriber = (ref) =>{
  remove(ref);
}

export const doRemoveSubscription = (ref) =>{
  remove(ref);
}

export const doUploadVideo = (userId, videoLink, title, category) =>{
  const currentTime = date.format(new Date(), 'HH:mm:ss[ ]DD-MM-YYYY');
  const videosRef = ref(db, `videos`);
  const newVideostRef = push(videosRef);
  set(newVideostRef, { userId, videoLink, title, category, uploadedAt:currentTime, viewCount:0 });
}

export const doIncreaseViewCountOnVideo = (videoId, viewCount) =>{
  update(ref(db, `videos/${videoId}`), {viewCount});
}

export const doCommentOnVideo = (videoId, commentId) =>{
  const videosRef = ref(db, `videos/${videoId}/comments`);
  const newVideostRef = push(videosRef);
  set(newVideostRef, { commentId });
}

export const addComment = (videoId, userId, text) =>{
  const commentsRef = ref(db, `comments`);
  const newCommentsRef = push(commentsRef);
  set(newCommentsRef, { userId, text });
  doCommentOnVideo(videoId,newCommentsRef.key);
}

export const doReplyOnComment = (commentId, replyId) =>{
  const commentsRef = ref(db, `comments/${commentId}/replies`);
  const newCommentsRef = push(commentsRef);
  set(newCommentsRef, { replyId });
}

export const addReply = (commentId, userId, text) =>{
  const replisRef = ref(db, `replies`);
  const newReplisRef = push(replisRef);
  set(newReplisRef, { userId, text});
  doReplyOnComment(commentId, newReplisRef.key);
}

export const addLikeToVideo = (videoId, userId) =>{
  const videosRef = ref(db, `videos/${videoId}/likes`);
  const newVideosRef = push(videosRef);
  set(newVideosRef, { userId});
}

export const addDisLikeToVideo = (videoId, userId) =>{
  const videosRef = ref(db, `videos/${videoId}/dislikes`);
  const newVideosRef = push(videosRef);
  set(newVideosRef, { userId});
}

export const removeLikeFromVideo = (ref) =>{
  remove(ref);
}

export const removeDisLikeFromVideo = (ref) =>{
  remove(ref);
}

export const addLikeToComment = (commentId, userId) =>{
  const commentsRef = ref(db, `comments/${commentId}/likes`);
  const newCommentsRef = push(commentsRef);
  set(newCommentsRef, { userId});
}

export const addDisLikeToComment = (commentId, userId) =>{
  const commentsRef = ref(db, `comments/${commentId}/dislikes`);
  const newCommentsRef = push(commentsRef);
  set(newCommentsRef, { userId});
}

export const removeLikeFromComment = (ref) =>{
  remove(ref);
}

export const removeDisLikeFromComment = (ref) =>{
  remove(ref);
}

export const addLikeToReply = (replyId, userId) =>{
  const repliesRef = ref(db, `replies/${replyId}/likes`);
  const newReplisRef = push(repliesRef);
  set(newReplisRef, { userId});
}

export const addDisLikeToReply = (replyId, userId) =>{
  const repliesRef = ref(db, `replies/${replyId}/dislikes`);
  const newReplisRef = push(repliesRef);
  set(newReplisRef, { userId});
}

export const removeLikeFromReply = (ref) =>{
  remove(ref);
}

export const removeDisLikeFromReply = (ref) =>{
  remove(ref);
}



