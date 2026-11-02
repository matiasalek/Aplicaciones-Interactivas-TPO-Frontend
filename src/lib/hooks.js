import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

export function useResource(
  path,
  { authenticated = false, optional404 = false } = {},
) {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    if (!path) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    const controller = new AbortController();
    setState({ loading: true, data: null, error: null });
    api(path, { authenticated, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({
            loading: false,
            data: null,
            error: optional404 && error.status === 404 ? null : error,
          });
      });
    return () => controller.abort();
  }, [path, authenticated, optional404, revision]);
  return { ...state, reload };
}

export function useMutation() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const locked = useRef(false);
  async function run(action) {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError(null);
    try {
      return await action();
    } catch (failure) {
      setError(failure);
      return undefined;
    } finally {
      locked.current = false;
      setPending(false);
    }
  }
  return { pending, error, run, clearError: () => setError(null) };
}
