import {defs, tiny} from './examples/common.js';
import {model_defs} from './model-defs.js';


// Components
import {GameObject} from './gameobject.js';
import {components} from './component.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        this.hover = this.swarm = false;

        this.shapes = {
            'sun': new defs.Subdivision_Sphere(4), // declare shapes
            'bow': new model_defs.Bow(),
            'arrow': new model_defs.Arrow(),
            'target': new model_defs.Target(),
        };

        // *** Materials
        this.materials = {
            sun: new Material(new defs.Phong_Shader(), // declare materials
                {ambient: 1.0}),
            arrow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#deb887')}),
            bow: new Material(new defs.Phong_Shader(),
                {ambient: .3, diffusivity: .8, color: hex_color('#fff8dc')}),
            target: new Material(new model_defs.Target_Shader(),
                {ambient: .3, diffusivity: .8})
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, 0, -30));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}
const Controls = defs.Movement_Controls =
    class Controls extends Scene {
        // **Movement_Controls** is a Scene that can be attached to a canvas, like any other
        // Scene, but it is a Secondary Scene Component -- meant to stack alongside other
        // scenes.  Rather than drawing anything it embeds both first-person and third-
        // person style controls into the website.  These can be used to manually move your
        // camera or other objects smoothly through your scene using key, mouse, and HTML
        // button controls to help you explore what's in it.
        constructor() {
            super();
            const data_members = {
                roll: 0, look_around_locked: true,
                thrust: vec3(0, 0, 0), pos: vec3(0, 0, 0), z_axis: vec3(0, 0, 0),
                radians_per_frame: 1 / 200, meters_per_frame: 20, speed_multiplier: 1
            };
            Object.assign(this, data_members);

            this.mouse_enabled_canvases = new Set();
            this.will_take_over_graphics_state = true;
        }

        set_recipient(matrix_closure, inverse_closure) {
            // set_recipient(): The camera matrix is not actually stored here inside Movement_Controls;
            // instead, track an external target matrix to modify.  Targets must be pointer references
            // made using closures.
            this.matrix = matrix_closure;
            this.inverse = inverse_closure;
        }

        reset(graphics_state) {
            // reset(): Initially, the default target is the camera matrix that Shaders use, stored in the
            // encountered program_state object.  Targets must be pointer references made using closures.
            this.set_recipient(() => graphics_state.camera_transform,
                () => graphics_state.camera_inverse);
        }

        add_mouse_controls(canvas) {
            // add_mouse_controls():  Attach HTML mouse events to the drawing canvas.
            // First, measure mouse steering, for rotating the flyaround camera:
            this.mouse = {"from_center": vec(0, 0)};
            const mouse_position = (e, rect = canvas.getBoundingClientRect()) =>
                vec(e.clientX - (rect.left + rect.right) / 2, e.clientY - (rect.bottom + rect.top) / 2);
            // Set up mouse response.  The last one stops us from reacting if the mouse leaves the canvas:
            document.addEventListener("mouseup", e => {
                this.mouse.anchor = undefined;
            });
            canvas.addEventListener("mousedown", e => {
                e.preventDefault();
                this.mouse.anchor = mouse_position(e);
            });
            canvas.addEventListener("mousemove", e => {
                e.preventDefault();
                this.mouse.from_center = mouse_position(e);
            });
            canvas.addEventListener("mouseout", e => {
                if (!this.mouse.anchor) this.mouse.from_center.scale_by(0)
            });
        }

        show_explanation(document_element) {
        }

       make_control_panel() {
            // make_control_panel(): Sets up a panel of interactive HTML elements, including
            // buttons with key bindings for affecting this scene, and live info readouts.
            this.control_panel.innerHTML += "Click and drag the scene to spin your viewpoint around it.<br>";
            this.live_string(box => box.textContent = "- Position: " + this.pos[0].toFixed(2) + ", " + this.pos[1].toFixed(2)
                + ", " + this.pos[2].toFixed(2));
            this.new_line();
            // The facing directions are surprisingly affected by the left hand rule:
            this.live_string(box => box.textContent = "- Facing: " + ((this.z_axis[0] > 0 ? "West " : "East ")
                + (this.z_axis[1] > 0 ? "Down " : "Up ") + (this.z_axis[2] > 0 ? "North" : "South")));
            //this.new_line();
            //this.new_line();
            this.new_line();
            const dir = this.control_panel.appendChild(document.createElement("span"));
            dir.style.margin = "37px";
            this.key_triggered_button("Up", ["w"], () => this.thrust[1] = -1, "#77d777", () => this.thrust[1] = 0);
            this.new_line();
            //this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);a
            this.key_triggered_button("Left", ["a"], () => this.thrust[0] = 1,  "#77d777", () => this.thrust[0] = 0);
            //this.key_triggered_button("Back", ["s"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
            this.key_triggered_button("Down", ["s"], () => this.thrust[1] = 1,  "#77d777", () => this.thrust[1] = 0);
            this.key_triggered_button("Right", ["d"], () => this.thrust[0] = -1,  "#77d777", () => this.thrust[0] = 0);
            this.new_line();
            this.new_line();
            const speed_controls = this.control_panel.appendChild(document.createElement("span"));
            //speed_controls.style.margin = "30px";
            this.key_triggered_button("-", ["z"], () =>
                this.speed_multiplier /= 1.2, "#add8e6", undefined, undefined, speed_controls);
            this.live_string(box => {
                box.textContent = "Arrow Power: " + this.speed_multiplier.toFixed(2)
            }, speed_controls);
            this.key_triggered_button("+", ["x"], () =>
                this.speed_multiplier *= 1.2, "#0800f6", undefined, undefined, speed_controls);
                this.new_line();
            const speed_controls2 = this.control_panel.appendChild(document.createElement("span"));
            speed_controls2.style.margin = "5px";
            this.key_triggered_button("Reset Arrow Power:", [" "], () => {
                this.speed_multiplier = 1;
            }, "#ff7f7f");
            //this.key_triggered_button("Roll left", [","], () => this.roll = 1, undefined, () => this.roll = 0);
            //this.key_triggered_button("Roll right", ["."], () => this.roll = -1, undefined, () => this.roll = 0);
            this.new_line();
            this.key_triggered_button("(Un)freeze mouse look around", ["f"], () => this.look_around_locked ^= 1, "#8B8885");
            this.new_line();
            /*this.key_triggered_button("Go to world origin", ["r"], () => {
                this.matrix().set_identity(4, 4);
                this.inverse().set_identity(4, 4)
            }, "#8B8885");*/
            this.new_line();

            this.key_triggered_button("Reset position", ["r"], () => {
                this.inverse().set(Mat4.look_at(vec3(0, 0, 30), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.new_line();
            /*this.key_triggered_button("from right", ["2"], () => {
                this.inverse().set(Mat4.look_at(vec3(10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.key_triggered_button("from rear", ["3"], () => {
                this.inverse().set(Mat4.look_at(vec3(0, 0, -10), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.key_triggered_button("from left", ["4"], () => {
                this.inverse().set(Mat4.look_at(vec3(-10, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0)));
                this.matrix().set(Mat4.inverse(this.inverse()));
            }, "#8B8885");
            this.new_line();*/
            this.key_triggered_button("SHOOT!", ["Enter"],
                () => {
                    
                }, "#ff0000");
            this.new_line();
            this.key_triggered_button("Attach to global camera", ["Shift", "R"],
                () => {
                    this.will_take_over_graphics_state = true
                }, "#8B8885");
            this.new_line();
        }

        first_person_flyaround(radians_per_frame, meters_per_frame, leeway = 70) {
            // (Internal helper function)
            // Compare mouse's location to all four corners of a dead box:
            const offsets_from_dead_box = {
                plus: [this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway],
                minus: [this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway]
            };
            // Apply a camera rotation movement, but only when the mouse is
            // past a minimum distance (leeway) from the canvas's center:
            if (!this.look_around_locked)
                // If steering, steer according to "mouse_from_center" vector, but don't
                // start increasing until outside a leeway window from the center.
                for (let i = 0; i < 2; i++) {                                     // The &&'s in the next line might zero the vectors out:
                    let o = offsets_from_dead_box,
                        velocity = ((o.minus[i] > 0 && o.minus[i]) || (o.plus[i] < 0 && o.plus[i])) * radians_per_frame;
                    // On X step, rotate around Y axis, and vice versa.
                    this.matrix().post_multiply(Mat4.rotation(-velocity, i, 1 - i, 0));
                    this.inverse().pre_multiply(Mat4.rotation(+velocity, i, 1 - i, 0));
                }
            this.matrix().post_multiply(Mat4.rotation(-.1 * this.roll, 0, 0, 1));
            this.inverse().pre_multiply(Mat4.rotation(+.1 * this.roll, 0, 0, 1));
            // Now apply translation movement of the camera, in the newest local coordinate frame.
            this.matrix().post_multiply(Mat4.translation(...this.thrust.times(-meters_per_frame)));
            this.inverse().pre_multiply(Mat4.translation(...this.thrust.times(+meters_per_frame)));
        }

        third_person_arcball(radians_per_frame) {
            // (Internal helper function)
            // Spin the scene around a point on an axis determined by user mouse drag:
            const dragging_vector = this.mouse.from_center.minus(this.mouse.anchor);
            if (dragging_vector.norm() <= 0)
                return;
            this.matrix().post_multiply(Mat4.translation(0, 0, -25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, +25));

            const rotation = Mat4.rotation(radians_per_frame * dragging_vector.norm(),
                dragging_vector[1], dragging_vector[0], 0);
            this.matrix().post_multiply(rotation);
            this.inverse().pre_multiply(rotation);

            this.matrix().post_multiply(Mat4.translation(0, 0, +25));
            this.inverse().pre_multiply(Mat4.translation(0, 0, -25));
        }

        display(context, graphics_state, dt = graphics_state.animation_delta_time / 1000) {
            // The whole process of acting upon controls begins here.
            const m = this.speed_multiplier * this.meters_per_frame,
                r = this.speed_multiplier * this.radians_per_frame;

            if (this.will_take_over_graphics_state) {
                this.reset(graphics_state);
                this.will_take_over_graphics_state = false;
            }

            if (!this.mouse_enabled_canvases.has(context.canvas)) {
                this.add_mouse_controls(context.canvas);
                this.mouse_enabled_canvases.add(context.canvas)
            }
            // Move in first-person.  Scale the normal camera aiming speed by dt for smoothness:
            this.first_person_flyaround(dt * r, dt * m);
            // Also apply third-person "arcball" camera mode if a mouse drag is occurring:
            if (this.mouse.anchor)
                this.third_person_arcball(dt * r);
            // Log some values:
            this.pos = this.inverse().times(vec4(0, 0, 0, 1));
            this.z_axis = this.inverse().times(vec4(0, 0, 1, 0));
        }
    }


export class FinalProject extends Base_Scene {

    constructor()
    {
        super();
        
        this.gameobjects = [];                               // List of GameObjects in scene       
        
    }

    // Make a special function that spawns in a GameObject into the scene (instantiates a GameObject using a "prefab")
    spawn_gameObject(model, start_transform, components, material)
    {
        this.gameobjects.push(new GameObject(model, start_transform, components, material));
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        this.key_triggered_button("Spawn Arrow", ["v"], () => this.spawn_gameObject(this.shapes.arrow,
         Mat4.identity().times(Mat4.translation(0,0,-10)),[new components.ForwardDown()], this.materials.arrow));
        this.key_triggered_button("Spawn Arrow Towards Edge", ["x"], () => this.spawn_gameObject(this.shapes.arrow,
         Mat4.identity().times(Mat4.translation(0,0,-10)),[new components.RandomDirection()], this.materials.arrow));
        this.key_triggered_button("Spawn Arrow Outside", ["o"], () => this.spawn_gameObject(this.shapes.arrow,
         Mat4.identity().times(Mat4.translation(0,0,-10)),[new components.Outside()], this.materials.arrow));
    }

    
    display(context, program_state) {
        super.display(context, program_state);
        
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        // sun
        let sun_transform = Mat4.identity();
        let a = 3;
        let b = 1.5;
        let w = (1/3) * Math.PI; 
        let sun_radius = a + b*Math.sin(w*t);
        let color_gradient = 0.5 + 0.5*Math.sin(w * t)
        let sun_color = vec4(1, color_gradient, color_gradient, 1);
        sun_transform = sun_transform.times(Mat4.scale(sun_radius, sun_radius, sun_radius));
        program_state.lights =  [new Light(vec4(0, 0, 0, 1), color(1, color_gradient, color_gradient, 1), 10 ** sun_radius)];
        let sun_material = this.materials.sun;
        sun_material = sun_material.override({color:sun_color});
        //this.shapes.sun.draw(context, program_state, sun_transform, sun_material);

        // bow
        let bow_transform = Mat4.identity();
        bow_transform = bow_transform.times(Mat4.translation(5, 0, -10));
        this.shapes.bow.draw(context, program_state, bow_transform, this.materials.bow);

        // move
        let arrow_transform = Mat4.identity();
        arrow_transform = arrow_transform.times(Mat4.translation(t, 0, -10));
      
        // arrow 
        // I commented this out for cleanliness - Ryan  
        // this.shapes.arrow.draw(context, program_state, arrow_transform, this.materials.arrow);

        // target
        let target_transform = Mat4.identity();
        target_transform = target_transform.times(Mat4.rotation(Math.PI/2, 0, 1, 0))
            .times(Mat4.translation(10, 0, 50));
        this.shapes.target.draw(context, program_state, target_transform, this.materials.target);

        
        // Update each GameObject in the scene then draw it
        for(let i = 0; i < this.gameobjects.length; i++)
        {
            
            if(this.gameobjects[i].transform.model_transform[0][3] + 11 > target_transform[0][3] && 
            this.gameobjects[i].transform.model_transform[1][3] > target_transform[1][3] - 20 &&
            this.gameobjects[i].transform.model_transform[1][3] < target_transform[1][3] + 20){
                this.gameobjects[i].update(0,0);
            }
            else{
                this.gameobjects[i].update(t, dt);
            }
            this.gameobjects[i].draw(context, program_state);

        }
    }
}




