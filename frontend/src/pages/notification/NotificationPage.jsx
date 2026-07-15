import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import { formatPostDate } from "../../utils/date";

import { IoSettingsOutline } from "react-icons/io5";
import { FaTrash, FaUser, FaRegComment } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  // TODO: Get all notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  // TODO: Delete all notifications
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: () => {
      toast.success("Notifications deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  // TODO: Delete single notification
  const { mutate: deleteNotification } = useMutation({
    mutationFn: async (id) => {
      try {
        const res = await fetch(`/api/notifications/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: () => {
      toast.success("Notification deleted successfully");

      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },

    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <p className="font-bold">Notifications</p>

        <div className="dropdown">
          <div tabIndex={0} role="button" className="m-1 cursor-pointer">
            <IoSettingsOutline className="w-5 h-5" />
          </div>

          <ul
            tabIndex={0}
            className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <button onClick={deleteNotifications}>
                Delete all notifications
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center h-full items-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Empty */}
      {notifications?.length === 0 && (
        <div className="text-center p-4 font-bold">No notifications 🤔</div>
      )}

      {/* Notifications */}
      {notifications?.map((notification) => (
        <div
          key={notification._id}
          className="border-b border-gray-700 hover:bg-gray-900 transition"
        >
          <div className="flex items-start gap-3 p-4">
            {/* Icon */}
            <div className="mt-1">
              {notification.type === "follow" && (
                <FaUser className="w-6 h-6 text-primary" />
              )}

              {notification.type === "like" && (
                <FaHeart className="w-6 h-6 text-red-500" />
              )}

              {notification.type === "comment" && (
                <FaRegComment className="w-6 h-6 text-sky-500" />
              )}
            </div>

            {/* User + Message */}
            <Link
              to={`/profile/${notification.from.username}`}
              className="flex gap-3 flex-1"
            >
              <div className="avatar">
                <div className="w-9 rounded-full">
                  <img
                    src={
                      notification.from.profileImg || "/avatar-placeholder.png"
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex gap-1 items-center">
                  <span className="font-bold">
                    @{notification.from.username}
                  </span>

                  <span>
                    {notification.type === "follow"
                      ? "followed you"
                      : notification.type === "like"
                        ? "liked your post"
                        : "commented on your post"}
                  </span>
                </div>

                <span className="text-sm text-gray-500">
                  {formatPostDate(notification.createdAt)}
                </span>
              </div>
            </Link>

            {/* Delete Icon */}
            <button
              onClick={() => deleteNotification(notification._id)}
              className="
                p-2
                rounded-full
                text-gray-500
                hover:text-red-500
                hover:bg-red-500/10
                transition
                cursor-pointer
              "
              title="Delete notification"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationPage;
