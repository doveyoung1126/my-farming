'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Fragment } from 'react';

interface ActionConfig {
  /**
   * The URL search parameter to watch for (e.g., 'edit', 'delete').
   */
  param: string;
  /**
   * A function that returns the React component to render (e.g., a modal)
   * when the specified `param` is found in the URL.
   * @param id The value of the URL parameter (e.g., the ID of the item to edit).
   * @param onClose A function to be called by the component to signal that it should be closed.
   *                This will remove the relevant parameter from the URL.
   * @returns A React.ReactNode to be rendered.
   */
  render: (id: string, onClose: () => void) => React.ReactNode;
}

interface UrlActionHandlerProps {
  /**
   * An array of action configurations.
   */
  actions: ActionConfig[];
}

/**
 * A client component that listens for specific URL search parameters and renders
 * corresponding components, typically modals for actions like editing or deleting.
 * This component centralizes the logic for URL-driven state management,
 * allowing for clean, decoupled, and reusable implementation of such features.
 *
 * @example
 * <UrlActionHandler
 *   actions={[
 *     {
 *       param: 'editRecord',
 *       render: (id, onClose) => (
 *         <EditRecordModal recordId={id} isOpen={true} onClose={onClose} />
 *       ),
 *     },
 *     {
 *       param: 'deleteRecord',
 *       render: (id, onClose) => (
 *         <ConfirmDeleteModal recordId={id} isOpen={true} onClose={onClose} />
 *       ),
 *     },
 *   ]}
 * />
 */
export function UrlActionHandler({ actions }: UrlActionHandlerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClose = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    // Remove all parameters that this handler is configured to listen for.
    actions.forEach(action => newParams.delete(action.param));
    
    const newSearch = newParams.toString();
    const newUrl = newSearch ? `${pathname}?${newSearch}` : pathname;

    // Use router.replace to avoid adding a new entry to the browser's history.
    router.replace(newUrl, { scroll: false });
  };

  return (
    <Fragment>
      {actions.map(({ param, render }) => {
        const id = searchParams.get(param);
        // If the parameter exists in the URL, render the associated component.
        if (id) {
          return <Fragment key={param}>{render(id, handleClose)}</Fragment>;
        }
        return null;
      })}
    </Fragment>
  );
}
