import React, { useState, useRef } from "react";
import {
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { Save, Cancel } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from "./Axiosinstance";
import PropTypes from 'prop-types';
import { features } from './Constants/Constants';

const CreateRole = ({ onRoleCreated, onCancel }) => {
  const [roleName, setRoleName] = useState("");
  const [roleNameError, setRoleNameError] = useState(false);
  const roleNameRef = useRef(null);
  const [checkedPermissions, setCheckedPermissions] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allPermissions = ["VIEW", "CREATE", "EDIT", "DELETE"];

  const handleCheckboxChange = (feature, permission) => {
    setCheckedPermissions((prev) => ({
      ...prev,
      [feature]: {
        ...prev[feature],
        [permission]: !prev[feature]?.[permission],
      },
    }));
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setRoleNameError(true);
      if (roleNameRef.current) {
        roleNameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        roleNameRef.current.focus();
      }
      return;
    }

    setRoleNameError(false);
    setIsSubmitting(true);

    const featurePermissions = features.map((feature) => {
      const permissionsForFeature = checkedPermissions[feature] || {};
      const permissionsObj = allPermissions.reduce((acc, permission) => {
        acc[permission] = !!permissionsForFeature[permission]; // ensure true/false
        return acc;
      }, {});
      return { feature, permissions: permissionsObj };
    });

    const response = {
      name: roleName.toUpperCase(),
      featurePermissions: featurePermissions,
    };

    try {
      const apiResponse = await axios.post("/roles/create", response, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      //  toast.success("Role created successfully!", { position: "top-right", autoClose: 5000 });

      if (onRoleCreated) {
        onRoleCreated({
          roleId: apiResponse.data.roleId,
          roleName: roleName,
        });
      }


      setRoleName("");
      setCheckedPermissions({});
    } catch (error) {
      console.error('Error details:', error);
      toast.error(error.response?.data?.details || error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create role",
        { position: "top-right", autoClose: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleSelectAll = (feature) => {
    const allChecked = allPermissions.every(
      (permission) => checkedPermissions[feature]?.[permission]
    );
    setCheckedPermissions((prev) => ({
      ...prev,
      [feature]: allChecked
        ? allPermissions.reduce((acc, p) => ({ ...acc, [p]: false }), {})
        : allPermissions.reduce((acc, p) => ({ ...acc, [p]: true }), {}),
    }));
  };
  const renderCheckboxes = (feature) => {
    const allChecked = allPermissions.every(
      (permission) => checkedPermissions[feature]?.[permission]
    );
    const someChecked = allPermissions.some(
      (permission) => checkedPermissions[feature]?.[permission]
    );
    return (
      <Box display="flex" flexDirection="column">
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              indeterminate={!allChecked && someChecked}
              checked={allChecked}
              onChange={() => handleSelectAll(feature)}
            />
          }
          label={
            <span
              style={{
                fontFamily: "Marquis",
                fontSize: "16px",
                textTransform: "uppercase",
                fontWeight: "bold",
              }}
            >
              Select All
            </span>
          }
        />
        {allPermissions.map((permission, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                size="small"
                checked={!!checkedPermissions[feature]?.[permission]}
                onChange={() => handleCheckboxChange(feature, permission)}
              />
            }
            label={
              <span style={{ fontFamily: "Marquis", fontSize: "16px", textTransform: "uppercase" }}>
                {permission}
              </span>
            }
          />
        ))}
      </Box>
    );
  };
  return (
    <div style={{ width: '100%', overflow: 'auto' }}>
      <Typography variant="h4" gutterBottom style={{ fontFamily: "Marquis", fontSize: "30px" }}>
        Role Permission
      </Typography>

      <TextField
        fullWidth
        label={<span>Role Name <span style={{ color: "red" }}>*</span></span>}
        variant="outlined"
        value={roleName}
        onChange={(e) => {
          const value = e.target.value;
          if (/^[a-zA-Z\s]*$/.test(value) && value.length <= 50) {
            setRoleName(value);
          }
        }}
        error={roleNameError}
        helperText={roleNameError ? "Role Name is required" : ""}
        style={{ marginBottom: "20px", marginTop: "7px" }}
        inputRef={roleNameRef}
        inputProps={{
          maxLength: 50,
           placeholder:"Enter Role Name (e.g. Developer)"
        }}
        sx={{
          '& input::placeholder': {
            fontSize: '0.9rem',
            color: '#000',
          },
        }}
      />

      <Table style={{ borderCollapse: "collapse", width: "100%", borderRadius: '8px' }}>
        <TableHead>
          <TableRow>
            <TableCell style={{ border: "1px solid #ddd", padding: "8px", width: "25%", fontSize: "18px", backgroundColor: "#f5f5f5" }}>
              <b>FEATURES</b>
            </TableCell>
            <TableCell style={{ border: "1px solid #ddd", padding: "8px", width: "25%", backgroundColor: "#f5f5f5", fontSize: "18px" }}>
              <b>CAPABILITIES</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {features.map((feature, index) => (
            <TableRow key={index}>
              <TableCell style={{ border: "1px solid #ddd", padding: "8px", fontFamily: "Marquis", fontSize: "16px", textTransform: "uppercase" }}>
                {feature}
              </TableCell>
              <TableCell style={{ border: "1px solid #ddd", padding: "8px" }}>
                {renderCheckboxes(feature)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <hr />
      <Box display="flex" justifyContent="flex-end" gap={2}>
        <Button variant="outlined" onClick={onCancel} startIcon={<Cancel />}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={handleSave} startIcon={<Save />} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </Box>


    </div>
  );
};

CreateRole.propTypes = {
  onRoleCreated: PropTypes.func,
  onCancel: PropTypes.func,
};

export default CreateRole;
