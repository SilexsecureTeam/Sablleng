// src/components/Dashboard/Can.jsx
import React from "react";
import { useCan } from "../../utils/can";

const Can = ({ perform, children, fallback = null }) => {
  const { can } = useCan();

  return can(perform) ? <>{children}</> : fallback;
};

export default Can;
