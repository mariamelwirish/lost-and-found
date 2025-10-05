// // // import { Outlet } from "react-router-dom";
// // // import Navbar from "../components/Navbar.jsx";

// // // export default function AppLayout() {
// // //   return (
// // //     <>
// // //       <Navbar />
// // //       <Outlet />
// // //     </>
// // //   );
// // // }
// // // import { Outlet, NavLink, Link, useLocation } from "react-router-dom";

// // // export default function AppLayout() {
// // //   const { pathname } = useLocation();
// // //   const showTabs = pathname.startsWith("/lost") || pathname.startsWith("/my-posts");

// // //   return (
// // //     <>
// // //       <Navbar />
// // //       {showTabs && (
// // //         <div className="subnav">
// // //           <div className="subnav-inner">
// // //             <NavLink to="/lost" className={({isActive}) => "tab" + (isActive ? " active" : "")}>Posts</NavLink>
// // //             <NavLink to="/my-posts" className={({isActive}) => "tab" + (isActive ? " active" : "")}>My Posts</NavLink>
// // //             <div className="grow" />
// // //             <Link to="/my-posts/create" className="subnav-action">+ Create Post</Link>
// // //           </div>
// // //         </div>
// // //       )}
// // //       <Outlet />
// // //     </>
// // //   );
// // // }
// // import Navbar from "../components/Navbar";
// // import { Outlet, NavLink, useLocation } from "react-router-dom";

// // export default function AppLayout() {
// //   const { pathname } = useLocation();
// //   const showTabs = pathname.startsWith("/lost") || pathname.startsWith("/my-posts");

// //   return (
// //     <>
// //       <Navbar />

// //       {showTabs && (
// //         <div className="subnav">
// //           <div className="subnav-inner">
// //             <NavLink
// //               to="/lost"
// //               className={({ isActive }) => "tab" + (isActive ? " active" : "")}
// //             >
// //               Posts
// //             </NavLink>
// //             <NavLink
// //               to="/my-posts"
// //               className={({ isActive }) => "tab" + (isActive ? " active" : "")}
// //             >
// //               My Posts
// //             </NavLink>
// //             <div className="grow" />
// //             <NavLink to="/my-posts/create" className="subnav-action">
// //               + Create Post
// //             </NavLink>
// //           </div>
// //         </div>
// //       )}

// //       <Outlet />
// //     </>
// //   );
// // }
// import Navbar from "../components/Navbar";
// import { Outlet, NavLink, useLocation } from "react-router-dom";

// export default function AppLayout() {
//   const { pathname } = useLocation();
//   const showTabs = pathname.startsWith("/lost") || pathname.startsWith("/my-posts");

//   return (
//     <>
//       <Navbar />

//       {showTabs && (
//         <div className="subnav">
//           <div className="subnav-inner">
//             <NavLink
//               to="/lost"
//               className={({ isActive }) => "tab" + (isActive ? " active" : "")}
//             >
//               Posts
//             </NavLink>
//             <NavLink
//               to="/my-posts"
//               className={({ isActive }) => "tab" + (isActive ? " active" : "")}
//             >
//               My Posts
//             </NavLink>
//             <div className="grow" />
//             <NavLink to="/my-posts/create" className="subnav-action">
//               + Create Post
//             </NavLink>
//           </div>
//         </div>
//       )}
//   import { Link, NavLink, Outlet, useLocation } from "react-router-dom"; // make sure Link is imported

// // ...inside the component's return, AFTER <Outlet /> or anywhere in the fragment:
// <div className="fab-wrap">
//   <Link to="/my-posts/create" className="fab" aria-label="Create Post">
//     <span className="fab-plus">+</span>
//   </Link>
//   <div className="fab-label">Create Post</div>
// </div>
//       <Outlet />
      
//     </>
//   );
// }
import Navbar from "../components/Navbar";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const { pathname } = useLocation();
  const showTabs = pathname.startsWith("/lost") || pathname.startsWith("/my-posts");

  return (
    <>
      <Navbar />

      {showTabs && (
        <div className="subnav">
          <div className="subnav-inner">
            <NavLink
              to="/lost"
              className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
              Posts
            </NavLink>
            <NavLink
              to="/my-posts"
              className={({ isActive }) => "tab" + (isActive ? " active" : "")}
            >
              My Posts
            </NavLink>
          </div>
        </div>
      )}

      <Outlet />

      {/* Floating Create Post button (bottom-right).
          If you only want it on Lost/My Posts, leave it inside showTabs. */}
      {showTabs && (
        <div className="fab-wrap">
          <Link to="/my-posts/create" className="fab" aria-label="Create Post">
            <span className="fab-plus">+</span>
          </Link>
          <div className="fab-label">Create Post</div>
        </div>
      )}
    </>
  );
}

