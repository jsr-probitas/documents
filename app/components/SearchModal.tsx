/**
 * Search modal component using Pagefind
 */
export function SearchModal() {
  return (
    <div
      id="search-modal"
      class="search-modal"
      onclick="closeSearchOnBackdrop(event)"
    >
      <div class="search-modal-content">
        <div class="search-modal-header">
          <span class="search-modal-title">Search Documentation</span>
          <button
            type="button"
            class="search-modal-close"
            onclick="closeSearch()"
            aria-label="Close search"
          >
            <i class="ti ti-x" />
          </button>
        </div>
        <div id="search-container" />
      </div>
    </div>
  );
}
