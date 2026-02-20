export default function Asides() {
  return (
    <div>
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-gray-200 pt-5 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <img className="h-8 w-auto" src="/logo.svg" alt="logo" />
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              <a
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                href="/"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  className="text-gray-500 mr-4 flex-shrink-0 h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  ></path>
                </svg>
                Accueil
              </a>
              <div>
                <div className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md group flex items-center px-2 py-2 text-sm font-medium  justify-between">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      ></path>
                    </svg>
                    Habilitation
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-5 w-5 ease-in-out duration-300 "
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <ul className="max-h-0 overflow-hidden  text-sm font-medium ease-in-out duration-500 ">
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/Users"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>
                      Utilisateurs
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/Groups"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Groupe
                      d’utilisateurs
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md group flex items-center px-2 py-2 text-sm font-medium  justify-between">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                      ></path>
                    </svg>
                    Entrepôt de données
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-5 w-5 ease-in-out duration-300 "
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <ul className="max-h-0 overflow-hidden  text-sm font-medium ease-in-out duration-500 ">
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/Import"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>
                      Historique d'import
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/Formats"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Formats
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md group flex items-center px-2 py-2 text-sm font-medium  justify-between">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      ></path>
                    </svg>
                    Processus décisionnel
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-5 w-5 ease-in-out duration-300 "
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <ul className="max-h-0 overflow-hidden  text-sm font-medium ease-in-out duration-500 ">
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/GestionWorkflow"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Gestion
                      des flux de travail
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/activity"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Gestion
                      des activités
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/action"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Gestion
                      des actions
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md group flex items-center px-2 py-2 text-sm font-medium  justify-between">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      ></path>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      ></path>
                    </svg>
                    Supervision
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-5 w-5 ease-in-out duration-300 "
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <ul className="max-h-0 overflow-hidden  text-sm font-medium ease-in-out duration-500 ">
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/supervision"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Suivi
                      des traitements
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/stock_de_rejets"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Stock
                      des rejets
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md group flex items-center px-2 py-2 text-sm font-medium  justify-between">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                      className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                      ></path>
                    </svg>
                    Reengineering
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                    className="h-5 w-5 ease-in-out duration-300 "
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <ul className="max-h-0 overflow-hidden  text-sm font-medium ease-in-out duration-500 ">
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/GestionDesDomaines"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Gestion
                      des domaines
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/Majparam"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>Import
                      du paramétrage
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/RetroDocSenarioList"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>
                      Identification des scénarios
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                      href="/Structures"
                    >
                      <div className="mr-3 flex-shrink-0 h-6 w-6"></div>
                      Structures
                    </a>
                  </li>
                </ul>
              </div>
              <a
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                href="/"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                  data-slot="icon"
                  className="text-gray-400 group-hover:text-gray-500 mr-4 flex-shrink-0 h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  ></path>
                </svg>
                Ordonnanceur
              </a>
              <a
                className="bg-gray-100 text-gray-900 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                href="/"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
                >
                  <path d="M12 2a10 10 0 0 1 8.66 5.01l-2.16 1.25A7.5 7.5 0 0 0 12 4.5V2z" />
                  <path d="M21.54 12a9.96 9.96 0 0 1-2.45 6.35l-1.75-1.65A7.5 7.5 0 0 0 19.5 12h2.04z" />
                  <path d="M12 22a10 10 0 0 1-8.66-5.01l2.16-1.25A7.5 7.5 0 0 0 12 19.5V22z" />
                  <path d="M2.46 12a9.96 9.96 0 0 1 2.45-6.35l1.75 1.65A7.5 7.5 0 0 0 4.5 12H2.46z" />

                  <path
                    strokeLinecap="round"
                    d="M7 14v2.5M10 11v5.5M13 9v7.5M16 12v4.5M6 18.5h14"
                  />
                </svg>
                Restitution
              </a>
              {/* <a href="#">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  // xmlns:xlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  id="Calque_1"
                  x="0px"
                  y="0px"
                  viewBox="0 0 745.34 370.02"
                  // style={{ enableBackground: "new 0 0 745.34 370.02" }}
                  // xml:space="preserve"
                >
                  <style>{`
          .st0 { fill: #E51E29; }
          .st1 { fill: #E61E2A; }
          .st2 { fill: #656A6A; }
          .st3 { fill: #A6A8A8; }
        `}</style>
                  <g>
                    <path
                      className="st0"
                      d="M433.86,271.89v-5.74c1.78-0.25,3.66-0.51,5.64-0.76c1.97-0.25,3.76-0.57,5.35-0.96   c1.59-0.38,2.93-0.86,4.01-1.43c1.08-0.57,1.62-1.24,1.62-2.01c-0.13-0.51-0.22-1.24-0.29-2.2c-0.07-0.96-0.41-2.13-1.05-3.54   l-8.6-23.51c-1.4-3.31-5.29-4.97-11.66-4.97h-28.48c-4.84,0-7.78,1.65-8.79,4.95l-6.5,19.78c-0.51,1.14-0.76,2.79-0.76,4.95   c0,5.83,5.61,8.75,16.82,8.75v6.69h-43.01v-6.69c3.69-0.25,6.85-1.53,9.46-3.82c2.61-2.29,4.81-5.6,6.6-9.93l45.88-109.18   l5.73,2.29l45.31,113.55c1.78,2.68,3.18,4.33,4.21,4.97c0.25,0.26,1.3,0.61,3.15,1.05c1.85,0.45,4.43,1.12,7.74,2.01v5.74H433.86z    M417.23,169.24l-16.82,40.15c-1.4,3.06-2.1,5.23-2.1,6.5c0,1.91,2.36,2.87,7.07,2.87h24.09c3.82,0,5.73-0.76,5.73-2.29   c0-0.64-0.7-2.74-2.1-6.31L417.23,169.24z"
                    />
                    <path
                      className="st0"
                      d="M595.78,235.38c-1.15,6.63-3.28,12.4-6.4,17.3c-3.12,4.91-6.95,8.98-11.47,12.23   c-4.52,3.25-9.62,5.71-15.29,7.36c-5.67,1.65-11.57,2.48-17.68,2.48c-9.05,0-17.24-1.62-24.57-4.87   c-7.33-3.25-13.61-7.74-18.83-13.48c-5.23-5.74-9.24-12.52-12.04-20.36c-2.8-7.84-4.21-16.28-4.21-25.33   c0-9.94,1.59-19.05,4.78-27.34c3.18-8.28,7.49-15.42,12.9-21.41c5.42-5.99,11.72-10.64,18.92-13.96c7.2-3.31,14.88-4.97,23.04-4.97   c9.81,0,19.05,2.93,27.72,8.79c4.46-4.59,9.05-7.26,13.76-8.03c0.38,0.38,0.96,1.82,1.72,4.3c0.76,2.49,1.5,5.71,2.2,9.65   c0.7,3.95,1.3,8.48,1.82,13.57c0.51,5.1,0.76,10.45,0.76,16.06h-6.5c-2.93-12.23-8.03-21.44-15.29-27.62   c-7.26-6.18-15.74-9.27-25.42-9.27c-7.01,0-13,1.5-17.97,4.49c-4.97,3-9.05,6.95-12.23,11.85c-3.19,4.91-5.51,10.48-6.98,16.73   c-1.47,6.25-2.2,12.62-2.2,19.12c0,9.05,0.79,17.43,2.39,25.14c1.59,7.71,4.11,14.4,7.55,20.07c3.44,5.67,7.9,10.13,13.38,13.38   c5.48,3.25,12.04,4.87,19.69,4.87c4.84,0,9.21-0.51,13.09-1.53c3.89-1.02,7.46-2.77,10.71-5.26c3.25-2.49,6.24-5.86,8.98-10.13   c2.74-4.27,5.38-9.59,7.93-15.96L595.78,235.38z"
                    />
                  </g>
                  <g>
                    <path
                      className="st0"
                      d="M618.09,271.89c-2.08,0-4.08,0.05-6.01,0.16c-1.93,0.1-3.67,0.26-5.23,0.47l-0.62-4.21   c6.97-6.87,13.38-13.52,19.24-19.97c5.86-6.45,10.94-12.71,15.23-18.8c4.3-6.08,7.66-12.09,10.1-18.02   c2.43-5.93,3.65-11.8,3.65-17.63c0-6.24-1.72-10.89-5.15-13.96c-3.43-3.07-8.32-4.6-14.66-4.6c-5.93,0-10.38,1.07-13.34,3.2   c-2.96,2.13-4.45,5.12-4.45,8.97c3.64,1.04,5.46,2.96,5.46,5.77c0,5.1-2.21,7.64-6.63,7.64c-4.32,0-6.47-3.38-6.47-10.14   c0-7.8,2.6-13.73,7.8-17.79c5.2-4.06,13.05-6.08,23.56-6.08c18.72,0,28.08,8.63,28.08,25.9c0,5.93-0.93,11.54-2.8,16.85   c-1.87,5.3-4.74,10.58-8.63,15.84c-3.89,5.25-8.81,10.64-14.78,16.15c-5.96,5.51-13.04,11.44-21.23,17.79h27.65   c2.79,0,5.18-0.16,7.16-0.47c1.97-0.31,3.69-0.94,5.15-1.87c1.46-0.94,2.7-2.26,3.74-3.98c1.04-1.72,2.08-3.98,3.12-6.79l4.06,0.62   l-5.93,24.96H618.09z"
                    />
                  </g>
                  <g>
                    <path
                      className="st0"
                      d="M687.17,271.89v-5.74c12.11,0,18.16-4.4,18.16-13.21v-85.21c0-11.23-6.31-16.85-18.93-16.85v-5.73h55.44v5.73   c-11.73,0-17.59,5.62-17.59,16.85v85.21c0,8.81,6.12,13.21,18.35,13.21v5.74H687.17z"
                    />
                  </g>
                  <polygon
                    className="st1"
                    points="230.4,42.21 163.35,82 96.3,42.21 163.35,2.42 "
                  />
                  <polygon
                    className="st1"
                    points="230.4,327.67 163.35,367.46 96.3,327.67 163.35,287.88 "
                  />
                  <polygon
                    className="st1"
                    points="315.24,185.51 248.18,225.3 181.13,185.52 248.19,145.73 "
                  />
                  <polygon
                    className="st2"
                    points="325.98,173.46 257.19,134.1 257.19,57.29 325.98,96.66 "
                  />
                  <polygon
                    className="st3"
                    points="170.07,173.46 238.85,134.1 238.85,57.29 170.07,96.66 "
                  />
                  <polygon
                    className="st2"
                    points="170.07,199.8 238.85,239.16 238.85,315.97 170.07,276.6 "
                  />
                  <polygon
                    className="st3"
                    points="325.98,199.8 257.19,239.16 257.19,315.97 325.98,276.6 "
                  />
                  <polygon
                    className="st1"
                    points="10.74,185.51 77.79,225.3 144.85,185.52 77.79,145.73 "
                  />
                  <polygon
                    className="st3"
                    points="0,173.46 68.78,134.1 68.78,57.29 0,96.66 "
                  />
                  <polygon
                    className="st2"
                    points="155.91,173.46 87.13,134.1 87.13,57.29 155.91,96.66 "
                  />
                  <polygon
                    className="st3"
                    points="155.91,199.8 87.13,239.16 87.13,315.97 155.91,276.6 "
                  />
                  <polygon
                    className="st2"
                    points="0,199.8 68.78,239.16 68.78,315.97 0,276.6 "
                  />
                </svg>
                AC<sub>2</sub>I
              </a> */}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
