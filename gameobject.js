import {defs, tiny} from '../examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;


// Unity-inspired actor class 
class GameObject
{
    constructor(model, start_transform, components, material)
    {
        this.model = model;
        this.transform = new Transform(start_transform);
        this.components = components;
        this.material = material;
        
        // Physics vars
        this.dy = 0;
        
        for(let i = 0; i < components.length; i++)
        {
            this.components[i].initialize(this);
        }
        
        // Wait for all components to be initialized first before calling start method
        for(let i = 0; i < components.length; i++)
        {
            this.components[i].start();
        }
        
    }
    
    // DO NOT OVERRIDE
    update(time, deltaTime)
    {
        // Run update function for every component attached to this GameObject
        for(let i = 0; i < this.components.length; i++)
        {
            this.components[i].update(time, deltaTime);
        }
    }
    
    // DO NOT OVERRIDE
    draw(context, program_state)
    {
        this.model.draw(context, program_state, this.transform.model_transform, this.material);
    }
}

// Unity-inspired transform management class
class Transform
{
    constructor(start_transform)
    {
        this.model_transform = start_transform;
        this.local_transform = start_transform; 

        this.children = [];
        this.parent;
    }

    addChild(childTransform)
    {
        this.children.push(childTransform);
        childTransform.parent = this;

        // Update the local transform so that it is now relative to its new parent
        childTransform.local_transform = Mat4.inverse(this.model_transform).times(childTransform.local_transform);
    }

    
    // Translate the transform relative to the local or world coordinate system 
    translate(dx, dy, dz, isLocalSpace = true)
    {
        let local_translation = (isLocalSpace)? vec4(dx, dy, dz, 0) : Mat4.inverse(this.local_transform).times(vec4(dx, dy, dz, 0));

        this.transformLocal((Mat4.translation(local_translation[0], local_translation[1], local_translation[2])));
        
    }

    // TODO: Clamp rotation between two values

    rotate(dx, dy, dz)
    {
        let local_rotation = Mat4.rotation(dx, 1, 0, 0).times(Mat4.rotation(dy, 0, 1, 0)).times(Mat4.rotation(dz, 0, 0, 1));

        this.transformLocal(local_rotation);
    }
    

    
    // Rotate the Transform such that its right-pointing vector is repositioned in the direction of the vector provided
    setRight(newRight)
    {
        let newForward = newRight.cross(this.up()).normalized();
        let newUp = newForward.cross(newRight).normalized();

        this.setRotationMatrix(newRight, newUp, newForward);
    }

    // Dangerous function that overrides the current rotation values of the world position matrix for this Transform
    setRotationMatrix(u_hat, v_hat, w_hat)
    {
        let pos = this.position();
        let newMat = new Mat4([u_hat[0], v_hat[0], w_hat[0], pos[0]],
                              [u_hat[1], v_hat[1], w_hat[1], pos[1]],
                              [u_hat[2], v_hat[2], w_hat[2], pos[2]],
                              [0, 0, 0, 1]);

        this.local_transform = newMat;
        this.refreshModelMatrix();
    }

    position()
    {
        return vec3(this.model_transform[0][3], this.model_transform[1][3], this.model_transform[2][3]);
    }

    forward()
    {
        return vec3(this.model_transform[0][2], this.model_transform[1][2], this.model_transform[2][2]);
    }

    right()
    {
        return vec3(this.model_transform[0][0], this.model_transform[1][0], this.model_transform[2][0]);
    }

    up()
    {
        return vec3(this.model_transform[0][1], this.model_transform[1][1], this.model_transform[2][1]);
    }


    
    ///////////////////
    // HELPER METHODS
    ///////////////////
    
    // Method to ensure that model_transform is updated when local_transform is changed
    transformLocal(appliedMatrix)
    {
        this.local_transform = this.local_transform.times(appliedMatrix);
        this.refreshModelMatrix();
    }
    
    // Recalculate the world space transform matrix
    // This needs to be done whenever we update the local transform matrix (since model_transform is not being updated)
    refreshModelMatrix()
    {
        if(this.parent == null)
            this.model_transform = this.local_transform;
        else
            this.model_transform = this.parent.model_transform.times(this.local_transform);

        for(let i = 0; i < this.children.length; i++)
        {
            // Whenever we update the model matrix of a transform, we should update the model matrices of its children
            this.children[i].refreshModelMatrix();
        }
    }
}

export {GameObject, Transform};