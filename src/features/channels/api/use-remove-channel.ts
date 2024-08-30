import { useCallback, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

type RequestType = { id: Id<"channels"> }
type ResponseType = Id<"channels">

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
}

export const useRemoveChannel = () => {
  const [data, setData] = useState<ResponseType | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [status, setStatus] = useState<"success" | "error" | "settled" | "pending" | null>(null)


  const isPending = useMemo(() => status === "pending", [status])
  const isSuccess = useMemo(() => status === "success", [status])
  const isError = useMemo(() => status === "error", [status])
  const isSettled = useMemo(() => status === "settled", [status])

  const mutation = useMutation(api.channels.remove)

  const mutate = useCallback(async (values: RequestType, options?: Options) => {
    try {
      setStatus("pending")
      setData(null)
      setError(null)

      const response = await mutation(values)
      options?.onSuccess?.(response)
      return response
    } catch (error) {
      setStatus("error")
      options?.onError?.(error as Error)
      if (options?.throwError) {
        throw error
      }
    } finally {
      setStatus("settled")

      options?.onSettled?.()
    }
  }, [mutation])

  return {
    mutate,
    data,
    error,
    isPending,
    isError,
    isSuccess,
    isSettled
  }
}