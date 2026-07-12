import Input from "./Input";

const PasswordInput = (props) => {
  return (
    <Input
      type="password"
      label="Password"
      placeholder="Enter password"
      {...props}
    />
  );
};

export default PasswordInput;