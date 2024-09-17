import React from "react";

const UserInfo = () => {
  const mockUser = {
    name: "John Doe",
    avatar: "👤",
    coursesStarted: 3,
  };

  return (
    <div
      style={{
        backgroundColor: "yellow",
        borderRadius: "10px",
        padding: "20px",
        position: "relative",
        width: "200px",
        textAlign: "center",
        height: "150px",
      }}
    >
      {/* User Avatar */}
      <div style={{ position: "absolute", top: "-20px", left: "10px" }}>
        <div className="text-gray-800 text-3xl">{mockUser.avatar}</div>
      </div>

      {/* User Info */}
      <div style={{ marginTop: "40px" }}>
        <div className="text-gray-800 text-base">{mockUser.name}</div>
        <div className="text-gray-800 text-base">
          Courses Started: {mockUser.coursesStarted}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
