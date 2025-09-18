import React, { useState,useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  TextField, Table, TableHead, TableBody, TableRow, TableCell,
  FormControlLabel, Checkbox,Box, Typography
} from "@mui/material";
import { useTheme } from '@mui/material/styles';
import { features, checkboxNames } from "./Constants/Constants";

// ...imports remain the same

const RolePermission = ({initialRole }) => {
  const [roleName, setRoleName] = useState("");
  const [checkedPermissions, setCheckedPermissions] = useState({});
  const { state } = useLocation();

  useEffect(() => {
    if (state?.resetForm) {
      setRoleName('');
      setCheckedPermissions({});
      return;
    }

    if (initialRole) {
      setRoleName(initialRole.name || '');

      const permissionMap = {};
      initialRole.featurePermissions?.forEach(({ feature, permissions }) => {
        const perms = {};
        const availableCheckboxes = checkboxNames[feature] || ["View ", "Create", "Edit", "Delete"];
        availableCheckboxes.forEach(label => {
          const key = label.trim().toUpperCase();
          perms[label] = permissions?.[key] || false;
        });
        permissionMap[feature] = perms;
      });

      setCheckedPermissions(permissionMap);
    }
  }, [initialRole, state]);

  const styles = {
    tableCell: { border: "1px solid #ddd", padding: "8px" },
    header: { backgroundColor: "#f5f5f5", fontSize: "18px" },
    featureText: { fontFamily: "Marquis", fontSize: "16px", textTransform: "uppercase" }
  };

  const theme = useTheme();

  const renderCheckboxes = (feature) =>
    (checkboxNames[feature] || ["View ", "Create", "Edit", "Delete"]).map((permission, idx) => {
      const isChecked = !!checkedPermissions[feature]?.[permission];
      return (
        <FormControlLabel
          key={idx}
          control={
            <Checkbox
              size="small"
              checked={isChecked}
              // disabled
              sx={{
                color: isChecked ? theme.palette.primary.main : undefined,
                '&.Mui-checked': {
                  color: theme.palette.primary.main
                }
              }}
            />
          }
          label={
            <span style={{
              ...styles.featureText,
              color: isChecked ? theme.palette.primary.main : undefined
            }}>
              {permission}
            </span>
          }
        />
      );
    });
  
  
  return (
    <div style={{ width: '100%', overflow: 'auto' }}>
      <Typography variant="h4" gutterBottom style={{ fontFamily: "Marquis", fontSize: "30px" }}>
        Role Permission
      </Typography>

      <TextField
        fullWidth
        label={<span>Role Name</span>}
        variant="outlined"
        value={roleName}
        // disabled // ← Makes this field read-only
        style={{ marginBottom: 20, marginTop: 7 }}
      />

      <Table style={{ borderCollapse: "collapse", width: "100%", borderRadius: 8 }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ ...styles.tableCell, ...styles.header }}><b>FEATURES</b></TableCell>
            <TableCell style={{ ...styles.tableCell, ...styles.header }}><b>CAPABILITIES</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {features.map((feature, i) => (
            <TableRow key={i}>
              <TableCell style={{ ...styles.tableCell, ...styles.featureText }}>{feature}</TableCell>
              <TableCell style={styles.tableCell}>
                <Box display="flex" flexDirection="column">{renderCheckboxes(feature)}</Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

    </div>
  );
};

export default RolePermission;
