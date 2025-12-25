import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import Detail from "./pages/Detail";
import Upload from "./pages/Upload";

export default function App() {
  const [page, setPage] = useState("feed");
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div>
      <Navbar onNav={setPage} />

      {page === "feed" && (
        <Feed
          onOpen={(id) => {
            setSelectedId(id);
            setPage("detail");
          }}
        />
      )}

      {page === "detail" && selectedId && (
        <Detail id={selectedId} onBack={() => setPage("feed")} />
      )}

      {page === "upload" && (
        <Upload onDone={() => setPage("feed")} />
      )}
    </div>
  );
}
