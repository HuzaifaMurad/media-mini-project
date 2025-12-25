// import React, { useState } from "react";
// import Navbar from "./components/Navbar";
// import Feed from "./pages/Feed";
// import Detail from "./pages/Detail";
// import Upload from "./pages/Upload";

// export default function App() {
//   const [page, setPage] = useState("feed");
//   const [selectedId, setSelectedId] = useState(null);

//   return (
//     <div>
//       <Navbar onNav={setPage} />

//       {page === "feed" && (
//         <Feed
//           onOpen={(id) => {
//             setSelectedId(id);
//             setPage("detail");
//           }}
//         />
//       )}

//       {page === "detail" && selectedId && (
//         <Detail id={selectedId} onBack={() => setPage("feed")} />
//       )}

//       {page === "upload" && (
//         <Upload onDone={() => setPage("feed")} />
//       )}
//     </div>
//   );
// }



import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Feed from "./pages/Feed";
import CreatorUpload from "./pages/CreatorUpload";
import Detail from "./pages/Detail";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <Link to="/" style={{ marginRight: 12 }}>Feed</Link>
        <Link to="/upload">Upload</Link>
      </div>

      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/upload" element={<CreatorUpload />} />

        {/* ✅ Detail page */}
        <Route path="/media/:id" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  );
}
