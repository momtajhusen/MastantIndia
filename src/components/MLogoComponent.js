import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

const MLogoComponent = ({ size = 200 }) => {
  return (
    <View style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
      >
        {/* Black background with rounded corners */}
        <Rect 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          fill="#000000" 
          rx="4" 
          ry="4" 
        />
        
        {/* Left white block - thick pillar with angled top */}
        <Path 
          d="M 10 85 
             L 10 25 
             L 25 15 
             L 40 15 
             L 40 25 
             L 30 35 
             L 30 85 
             Z" 
          fill="#FFFFFF"
        />
        
        {/* Right white block - thick pillar with angled top */}
        <Path 
          d="M 70 85 
             L 70 35 
             L 60 25 
             L 60 15 
             L 75 15 
             L 90 25 
             L 90 85 
             Z" 
          fill="#FFFFFF"
        />
        
        {/* Bottom center triangular cut (black triangle) */}
        <Path 
          d="M 40 85 
             L 50 70 
             L 60 85 
             Z" 
          fill="#000000"
        />
      </Svg>
    </View>
  );
};

// More accurate M logo version
const MLogoAccurate = ({ size = 200 }) => {
  return (
    <View style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
      >
        {/* Black background */}
        <Rect 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          fill="#000000" 
          rx="3" 
          ry="3" 
        />
        
        {/* Complete M shape as one path */}
        <Path 
          d="M 12 88 
             L 12 28 
             L 20 18 
             L 30 18 
             L 38 28 
             L 38 50 
             L 45 40 
             L 50 48 
             L 55 40 
             L 62 50 
             L 62 28 
             L 70 18 
             L 80 18 
             L 88 28 
             L 88 88 
             L 78 88 
             L 78 40 
             L 72 48 
             L 62 35 
             L 55 48 
             L 50 38 
             L 45 48 
             L 38 35 
             L 28 48 
             L 22 40 
             L 22 88 
             Z" 
          fill="#FFFFFF"
        />
        
        {/* Bottom triangular notch */}
        <Path 
          d="M 38 88 
             L 50 75 
             L 62 88 
             Z" 
          fill="#000000"
        />
      </Svg>
    </View>
  );
};

// Final perfect match version
const MLogoFinal = ({ size = 200 }) => {
  return (
    <View style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100"
      >
        {/* Black background */}
        <Rect 
          x="0" 
          y="0" 
          width="100" 
          height="100" 
          fill="#000000" 
          rx="6" 
          ry="6" 
        />
        
        {/* White base shape */}
        <Rect 
          x="12" 
          y="12" 
          width="76" 
          height="76" 
          fill="#FFFFFF" 
          rx="3" 
          ry="3" 
        />
        
        {/* Top center V cut */}
        <Path 
          d="M 30 12 
             L 50 42 
             L 70 12 
             Z" 
          fill="#000000"
        />
        
        {/* Bottom center triangle cut */}
        <Path 
          d="M 36 88 
             L 50 65 
             L 64 88 
             Z" 
          fill="#000000"
        />
      </Svg>
    </View>
  );
};

// Example usage component
const LogoDemo = () => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: 20,
    }}>
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
          M Logo - Different Approaches
        </Text>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          marginBottom: 30
        }}>
          <View style={{ alignItems: 'center' }}>
            <MLogoComponent size={80} />
            <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Block Method</Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <MLogoAccurate size={80} />
            <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Path Method</Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <MLogoFinal size={80} />
            <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Cut Method</Text>
          </View>
        </View>
      </View>
      
      <View>
        <Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>
          Final Version - Different Sizes:
        </Text>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <MLogoFinal size={40} />
          <MLogoFinal size={60} />
          <MLogoFinal size={80} />
          <MLogoFinal size={100} />
        </View>
      </View>
    </View>
  );
};

export default MLogoFinal;
export { MLogoComponent, MLogoAccurate, MLogoFinal, LogoDemo };