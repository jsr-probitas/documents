/**
 * Scroll to top button component
 */
export function ScrollToTop() {
  return (
    <button
      type="button"
      id="scroll-to-top"
      class="scroll-to-top"
      onclick="scrollToTop()"
      aria-label="Scroll to top"
    >
      <i class="ti ti-chevron-up" />
    </button>
  );
}
