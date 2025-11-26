import { TouchableOpacity } from "react-native";
import { TextSmall } from "./TextSmall";

export function AppLink({ 
  pressFunction, 
  text, 
	style,
}) {  
  return (
    <TouchableOpacity onPress={pressFunction}>
      <TextSmall style={{ fontWeight: "bold", textDecorationLine: "underline", ...style }}>
        {text}
      </TextSmall>
    </TouchableOpacity>
  );
}