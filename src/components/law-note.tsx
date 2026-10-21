export function LawNote() {
  return (
    <aside className="rounded-2xl border border-line bg-foam px-4 py-3 text-sm text-ink">
      <p className="font-medium">This is a listing, not a license.</p>
      <p className="mt-1 text-muted">
        Florida cottage food is a short list of low-risk foods, labeled and sold direct to a neighbor. Eggs, hot
        meals, and many sauces need a different permit. Check the official rules before you sell.
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <li>
          <a
            className="font-medium text-porch underline decoration-line underline-offset-2 hover:decoration-porch"
            href="https://www.fdacs.gov/Business-Services/Food-Establishments/Cottage-Foods"
            target="_blank"
            rel="noreferrer"
          >
            FDACS cottage foods
          </a>
        </li>
        <li>
          <a
            className="font-medium text-porch underline decoration-line underline-offset-2 hover:decoration-porch"
            href="https://ask.ifas.ufl.edu/publication/FS425"
            target="_blank"
            rel="noreferrer"
          >
            UF/IFAS allowed foods
          </a>
        </li>
        <li>
          <a
            className="font-medium text-porch underline decoration-line underline-offset-2 hover:decoration-porch"
            href="https://forrager.com/law/florida/"
            target="_blank"
            rel="noreferrer"
          >
            Florida law in plain language
          </a>
        </li>
      </ul>
    </aside>
  );
}
