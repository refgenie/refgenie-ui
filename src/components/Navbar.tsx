import { Link, useLocation } from 'react-router-dom';

import logo from '../assets/refgenie_logo.svg';

type NavLinkProps = {
  page: string; 
  title: string;
  position: string;
  currentPage: string;
}

const NavLink = (props: NavLinkProps) => {
  const { page, title, position, currentPage } = props;

  if (position === 'top') return (
    <Link className={`text-hover cursor-pointer ${currentPage === page ? 'text-dark' : 'text-black-50'}`} to={page}>
      <p className='mb-0 nav-hover cursor-pointer'>{title}</p>
    </Link>
  )

  return (
    <p className='mb-0'>
      <Link
        className={`text-hover cursor-pointer ${currentPage === page ? 'fw-light' : 'fw-lighter text-black-50'}`}
        style={currentPage === page ? { color: '#008066' } : {}}
        to={page}
      >
        {title}
      </Link>
    </p>
  );
};


function Navbar() {
  const location = useLocation().pathname.substring(1) || '';

  return (
    <>
      <div className='flex-0 sidebar border-end bg-body-secondary px-3'>
        <div className='row page-width sticky-top'>
          <div className='col-12 p-4'>
            <Link to='' className='text-decoration-none text-dark'>
              <img src={logo} alt="Refgenie Logo" className="logo" />
              {/* <h4 className='fw-lighter mb-0'>Refgenie</h4> */}
            </Link>
            <div className='col-12 text-start'>
              <p className='mt-3 mb-0'>
                Home
              </p>
              <div className='ps-2'>
                <NavLink page={'about'} title={'About'} position='side' currentPage={location}/>
                <a className='text-hover cursor-pointer text-black-50' href='https://refgenie.org' target='_blank' rel='noopener noreferrer'>
                  <p className='mb-0 nav-hover cursor-pointer text-black-50 fw-lighter'>Docs</p>
                </a>
              </div>
              
              <p className='mt-3 mb-0'>
                Browse
              </p>
              <div className='ps-2'>
                <NavLink page={'genomes'} title={'Genomes'} position='side' currentPage={location}/>
                <NavLink page={'assets'} title={'Assets'} position='side' currentPage={location}/>
                <NavLink page={'assetclasses'} title={'Asset Classes'} position='side' currentPage={location}/>
                <NavLink page={'recipes'} title={'Recipes'} position='side' currentPage={location}/>
              </div>
              
              <p className='mt-3 mb-0'>
                Manage
              </p>
              <div className='ps-2'>
                <NavLink page={'downloads'} title={'Downloads'} position='side' currentPage={location}/>
                <NavLink page={'config'} title={'Config'} position='side' currentPage={location}/>
              </div>

              <p className='mt-3 mb-0'>
                Tools
              </p>
              <div className='ps-2'>
                <NavLink page={'seqcol'} title={'SeqCol Validator'} position='side' currentPage={location}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex-0 topbar sticky-top'>
        <div className='row page-width'>
          <div className='col-12 pt-4 px-4'>
            <Link to='' className='text-decoration-none text-dark'>
              <h5 className='d-inline fw-light mb-3'>Refgenie</h5>
            </Link>
            <span className='d-inline float-end cursor-pointer dropdown-hover' data-bs-toggle='dropdown' aria-expanded='false'>
              <h5 className='bi bi-three-dots'></h5>
            </span>
            <div className='dropdown-menu px-3 shadow border-0'>
              <NavLink page={''} title={'Home'} position='side' currentPage={location}/>
              <NavLink page={'about'} title={'About'} position='side' currentPage={location}/>
              <a className='text-hover cursor-pointer text-black-50' href='https://refgenie.org' target='_blank' rel='noopener noreferrer'>
                <p className='mb-0 nav-hover cursor-pointer text-black-50 fw-lighter'>Docs</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
