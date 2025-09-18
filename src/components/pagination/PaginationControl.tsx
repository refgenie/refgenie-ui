type PaginationControlProps = {
  page: number;
  minPage: number;
  maxPage: number;
  offsetIndex: number;
  setOffsetIndex: (offsetIndex: number) => void;
};

export function PaginationControl(props: PaginationControlProps) {
  const {page, minPage, maxPage, offsetIndex, setOffsetIndex} = props;

  return (
    <div className='d-flex flex-row justify-content-center mt-3'>
      <span onClick={() => setOffsetIndex(minPage - 1)}>
        <h5 className={`text-dark bi bi-arrow-left-short me-1 cursor-pointer ${page === minPage && 'd-none'}`} /> 
      </span>

      {page > minPage + 1 && <span className='mx-2 text-dark text-opacity-50 pagination-hover cursor-pointer' onClick={() => handlePageClick(offsetIndex - 2, setOffsetIndex)}>{page - 2}</span>}
      {page > minPage && <span className='mx-2 text-dark text-opacity-50 pagination-hover cursor-pointer' onClick={() => handlePageClick(offsetIndex - 1, setOffsetIndex)}>{page - 1}</span>}

      <span className='mx-2 fw-bold cursor-pointer' onClick={() => setOffsetIndex(offsetIndex)}>{page}</span>

      {page < maxPage && <span className='mx-2 text-dark text-opacity-50 pagination-hover cursor-pointer' onClick={() => handlePageClick(offsetIndex + 1, setOffsetIndex)}>{page + 1}</span>}
      {page < maxPage - 1 && <span className='mx-2 text-dark text-opacity-50 pagination-hover cursor-pointer' onClick={() => handlePageClick(offsetIndex + 2, setOffsetIndex)}>{page + 2}</span>}

      <span onClick={() => setOffsetIndex(maxPage - 1)}>
        <h5 className={`text-dark bi bi-arrow-right-short ms-1 cursor-pointer ${page === maxPage && 'd-none'}`} />
      </span>
    </div>
  )
}

const handlePageClick = (newPage: number, setOffsetIndex: ((ofssetIndex: number) => void)) => {
  setOffsetIndex(newPage);
  document.querySelectorAll('.pagination-hover').forEach((el: Element) => {
    (el as HTMLElement).style.setProperty('--bs-text-opacity', '0.5', 'important');
  });
};
