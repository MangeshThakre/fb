import jwt from "jsonwebtoken";
import userModel from "../schema/userSchema.js";
import postModel from "../schema/postsSchema.js";
import frendRequestModel from "../schema/friendRequestSchema.js";
import friendsModel from "../schema/friendsSchema.js";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
import { request, response } from "express";

dotenv.config();
class controller {
  static jwt = jsonwebtoken;

  static base = (req, res) => {
    res.send({ data: "connected" });
  };

  static signup = async (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNo = req.body.phone;
    const password = req.body.password;
    const email = req.body.email;
    const DOB = req.body.date;

    try {
      const emailExist = await userModel.findOne({ email });
      if (emailExist !== null)
        return res.send({
          status: 200,
          phone: true,
          result: "email already exist",
        });

      const phoneNoExist = await userModel.findOne({ phoneNo });
      if (phoneNoExist !== null)
        return res.send({ status: 200, result: "phoneNo exist" });

      const saveUserInfo = new userModel({
        firstName,
        lastName,
        email,
        phoneNo,
        password,
        DOB,
        homeTown: {},
        currentCity: {},
      });
      const result = await saveUserInfo.save();
      console.log(result);
      var token = jwt.sign({ id: result._id }, process.env.ACCESS_TOKEN_SECRET);
      res.send({
        status: 200,
        Token: token,
      });
    } catch (error) {
      console.log(error);
      res.send({
        status: 200,
        Error: error,
      });
    }
  };

  static signin = async (req, res) => {
    if (req.body.phoneNo) {
      try {
        const response = await userModel.findOne({
          phoneNo: req.body.phoneNo,
          password: req.body.password,
        });
        if (response) {
          var token = jwt.sign(
            { id: response._id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res.send({ Token: token });
        } else res.json({ Token: "invalid" });
      } catch (error) {
        console.log(error);
        res.send({ error });
      }
    } else if (req.body.email) {
      try {
        console.table({ email: req.body.email, password: req.body.password });
        const response = await userModel.findOne({
          email: req.body.email,
          password: req.body.password,
        });
        if (response) {
          var token = jwt.sign(
            { id: response._id },
            process.env.ACCESS_TOKEN_SECRET
          );
          res.json({ Token: token });
        } else {
          res.json({ Token: "invalid" });
        }
      } catch (error) {
        console.log("error", error);
        res.json({ error });
      }
    }
  };

  static verify = async (req, res) => {
    try {
      const user_id = req.user.id;
      const response = await userModel.findById(user_id);
      console.log(response);
      res.json({
        id: response._id,
        firstName: response.firstName,
        lastName: response.lastName,
        phoneNo: response.phoneNo,
        email: response.email,
        DOB: response.DOB,
      });
    } catch (error) {
      console.log("error:", error);
      res.send({ statu: 401, error });
    }
  };

  static async insertPost(req, res) {
    const user_id = req.user.id;
    const text = req.body.text != "" ? req.body.text : null;
    const bg = req.body.bg ? req.body.bg : null;
    const photo = req.file ? req.file.path : null;
    try {
      const postData = {
        user_id,
        text,
        bg,
        photo,
        posted_at: new Date(),
      };
      const posts = new postModel(postData);
      const result = await posts.save();
      // console.log(result);
      res.json(req.body);
    } catch (error) {
      console.log("error :", error);
      res.json({
        status: 500,
      });
    }
  }

  static async getPosts(req, res) {
    const user_id = req.user.id;
    try {
      const response = await postModel.find({ user_id });
      res.json(response);
    } catch (error) {
      res.json({
        status: 500,
      });
    }
  }

  static async like_dislike(req, res) {
    const user_id = req.user.id;
    const likeDislike = req.body.likeDislike;
    const postId = req.body.postId;
    try {
      console.log(likeDislike);
      console.log(postId);

      const saveLike = await postModel.findByIdAndUpdate(postId, {
        like_dislike: likeDislike,
      });
      console.log(saveLike);
      res.json("successfully updated");
    } catch (error) {
      console.log("LIKE DISLIKE ERROR", error);
      res.json({ status: 500 });
    }
  }

  static async get_all_user(req, res) {
    const user_id = req.user.id;
    try {
      const response = await userModel
        .find({
          _id: { $nin: [user_id] },
        })
        .select("_id")
        .select("firstName")
        .select("lastName");

      const response_friendRequest = await frendRequestModel.find({
        request_id: user_id,
      });
      const friends = await friendsModel.find({ user_id });
      var arr = [];

      if (response_friendRequest.length == 0) {
        arr = response;
      } else {
        for (const user of response) {
          for (const request of response_friendRequest) {
            if (user._id != request.user_id) arr.push(user);
          }
        }
      }
      const allUsers = [];
      if (friends.length == 0) {
        allUsers = arr;
      } else {
        for (const user of arr) {
          for (const friend of friends) {
            if (user.id != friend.friend_id) allUsers.push(user);
          }
        }
      }
      res.json(allUsers);
    } catch (error) {
      res.json({ status: 500 });
      console.log("Error", error);
    }
  }

  static async friend_request(req, res) {
    const user_id = req.user.id;
    const request_id = req.query.requested_id;
    try {
      const frendRequestModelSave = new frendRequestModel({
        user_id,
        request_id,
      });
      const result = await frendRequestModelSave.save();
      res.json("sended");
    } catch (error) {
      res.json({ status: 500 });
    }
  }
  static async sended_friend_requests(req, res) {
    const user_id = req.user.id;
    try {
      const response = await frendRequestModel
        .find({ user_id })
        .select("request_id");
      res.json(response);
    } catch (error) {
      console.log("Error", error);
      res.json({ status: 500 });
    }
  }

  static async cancle_friend_request(req, res) {
    const user_id = req.user.id;
    const request_id = req.query.requested_id;
    try {
      const response = await frendRequestModel.findOneAndDelete({
        user_id: { $gte: user_id },
        request_id: { $gte: request_id },
      });
      console.log("deleted", response);
      res.json({ response });
    } catch (error) {
      console.log("Error", error);
      res.json({ status: 500 });
    }
  }

  static async get_friend_requests(req, res) {
    const user_id = req.user.id;
    try {
      const response = await frendRequestModel.aggregate([
        { $match: { request_id: user_id } },
        { $project: { userObjId: { $toObjectId: "$user_id" } } },
        {
          $lookup: {
            from: "userschemas",
            localField: "userObjId",
            foreignField: "_id",
            as: "requestDetail",
          },
        },
      ]);
      const data = response.length == 0 ? [] : response[0]?.requestDetail;
      res.json(data);
    } catch (error) {
      console.log(" ERROR get_friend_request :", error);
    }
  }

  static async confirm_friend_request(req, res) {
    const user_id = req.user.id;
    const confirmRequestId = req.query.conform_id;
    try {
      await new friendsModel({
        user_id,
        friend_id: confirmRequestId,
      }).save();
      await new friendsModel({
        user_id: confirmRequestId,
        friend_id: user_id,
      }).save();
      await frendRequestModel.findOneAndDelete({ user_id: confirmRequestId });
      res.json("confirmed");
    } catch (error) {
      console.log("Error confirm_friend_request:", error);
      res.json({ status: 500 });
    }
  }

  static async get_about_info(req, res) {
    const user_id = req.query.user;
    try {
      const response = await userModel.findById(user_id, { password: 0 });
      res.json(response);
    } catch (error) {
      console.log("get_about_info Error :", error);
    }
  }

  static async about_info(req, res) {
    const user_id = req.user.id;
    const currentCity = req.query?.CurrentCity;
    const homeTown = req.query?.Hometown;
    try {
      if (currentCity) {
        const response = await userModel.findByIdAndUpdate(user_id, {
          currentCity: { city: currentCity, type: "public" },
        });
        await res.json(response);
      } else {
        const response = await userModel.findByIdAndUpdate(user_id, {
          homeTown: { city: homeTown, type: "public" },
        });

        await res.json(response);
      }
    } catch (error) {
      console.log("abourInfo Error", error);
    }
  }
}
export default controller;
